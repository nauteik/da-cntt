import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { apiClient } from './apiClient';

const LOCATION_TRACKING_TASK = 'location-tracking-task';
const BATCH_SIZE = 10; // Send every 10 points
const TRACKING_INTERVAL = 30000; // 30 seconds

interface LocationPoint {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  altitude: number | null;
  recordedAt: string;
}

interface LocationBatchDTO {
  serviceDeliveryId: string;
  locations: LocationPoint[];
}

class LocationTrackingService {
  private isTracking = false;
  private serviceDeliveryId: string | null = null;
  private locationBuffer: LocationPoint[] = [];

  /**
   * Start tracking location in background
   */
  async startTracking(serviceDeliveryId: string): Promise<void> {
    if (this.isTracking) {
      console.log('[LocationTracking] Already tracking');
      return;
    }

    try {
      // Request permissions
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        throw new Error('Foreground location permission not granted');
      }

      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== 'granted') {
        console.warn('[LocationTracking] Background permission not granted - using foreground only');
      }

      this.serviceDeliveryId = serviceDeliveryId;
      this.isTracking = true;
      this.locationBuffer = [];

      // Define background task
      TaskManager.defineTask(LOCATION_TRACKING_TASK, async ({ data, error }: any) => {
        if (error) {
          console.error('[LocationTracking] Background task error:', error);
          return;
        }

        if (data) {
          const { locations } = data;
          await this.handleLocationUpdate(locations);
        }
      });

      // Start background location tracking
      await Location.startLocationUpdatesAsync(LOCATION_TRACKING_TASK, {
        accuracy: Location.Accuracy.Balanced, // Balance between accuracy and battery
        timeInterval: TRACKING_INTERVAL, // 30 seconds
        distanceInterval: 10, // 10 meters minimum movement
        foregroundService: {
          notificationTitle: 'Care Visit in Progress',
          notificationBody: 'Location is being tracked for this care visit',
          notificationColor: '#2196F3',
        },
      });

      console.log('[LocationTracking] Started tracking for service delivery:', serviceDeliveryId);
    } catch (error) {
      console.error('[LocationTracking] Failed to start tracking:', error);
      this.isTracking = false;
      throw error;
    }
  }

  /**
   * Stop tracking and upload remaining points
   */
  async stopTracking(): Promise<void> {
    if (!this.isTracking) {
      console.log('[LocationTracking] Not tracking');
      return;
    }

    try {
      // Stop background tracking
      const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TRACKING_TASK);
      if (isTaskRegistered) {
        await Location.stopLocationUpdatesAsync(LOCATION_TRACKING_TASK);
      }

      // Upload remaining buffered points
      if (this.locationBuffer.length > 0) {
        await this.uploadBatch(this.locationBuffer);
        this.locationBuffer = [];
      }

      this.isTracking = false;
      this.serviceDeliveryId = null;

      console.log('[LocationTracking] Stopped tracking');
    } catch (error) {
      console.error('[LocationTracking] Failed to stop tracking:', error);
      throw error;
    }
  }

  /**
   * Handle location updates from background task
   */
  private async handleLocationUpdate(locations: Location.LocationObject[]): Promise<void> {
    if (!this.serviceDeliveryId) {
      console.warn('[LocationTracking] No service delivery ID - skipping update');
      return;
    }

    for (const location of locations) {
      const point: LocationPoint = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        altitude: location.coords.altitude,
        recordedAt: new Date(location.timestamp).toISOString(),
      };

      this.locationBuffer.push(point);

      console.log('[LocationTracking] Buffered location:', {
        total: this.locationBuffer.length,
        lat: point.latitude,
        lon: point.longitude,
        accuracy: point.accuracy,
      });

      // Upload when buffer reaches batch size
      if (this.locationBuffer.length >= BATCH_SIZE) {
        await this.uploadBatch([...this.locationBuffer]);
        this.locationBuffer = [];
      }
    }
  }

  /**
   * Upload batch of location points to server
   */
  private async uploadBatch(points: LocationPoint[]): Promise<void> {
    if (!this.serviceDeliveryId || points.length === 0) {
      return;
    }

    try {
      console.log('[LocationTracking] Uploading batch:', {
        serviceDeliveryId: this.serviceDeliveryId,
        count: points.length,
      });

      const batchDTO: LocationBatchDTO = {
        serviceDeliveryId: this.serviceDeliveryId,
        locations: points,
      };

      const response = await apiClient.post('/location-tracking/batch', batchDTO);

      if (response.success) {
        console.log('[LocationTracking] Batch uploaded successfully:', response.data);
      } else {
        console.error('[LocationTracking] Failed to upload batch:', response.error);
        // Keep points in buffer for retry
        this.locationBuffer = [...points, ...this.locationBuffer];
      }
    } catch (error) {
      console.error('[LocationTracking] Error uploading batch:', error);
      // Keep points in buffer for retry
      this.locationBuffer = [...points, ...this.locationBuffer];
    }
  }

  /**
   * Get journey summary from server
   */
  async getJourneySummary(serviceDeliveryId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/location-tracking/journey/${serviceDeliveryId}`);
      if (response.success) {
        return response.data.data;
      }
      throw new Error(response.error || 'Failed to get journey summary');
    } catch (error) {
      console.error('[LocationTracking] Error getting journey summary:', error);
      throw error;
    }
  }

  /**
   * Check if currently tracking
   */
  getTrackingStatus(): { isTracking: boolean; serviceDeliveryId: string | null } {
    return {
      isTracking: this.isTracking,
      serviceDeliveryId: this.serviceDeliveryId,
    };
  }
}

export default new LocationTrackingService();
