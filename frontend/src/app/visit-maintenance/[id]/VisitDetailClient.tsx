"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, Button, Input, DatePicker, Select, Checkbox, Tag } from 'antd';
import Image from 'next/image';
import { CheckCircleOutlined } from '@ant-design/icons';
import type { VisitMaintenanceDTO } from '@/types/visitMaintenance';
import VisitHeader from '@/components/visit-maintenance/VisitHeader';
import LoadingFallback from '@/components/common/LoadingFallback';
import InlineError from '@/components/common/InlineError';
import { getVisitDetail } from '@/lib/api/visitMaintenance';
import { useClients } from '@/hooks/useClients';
import { useEmployees } from '@/hooks/useEmployees';
import { usePatientPersonal } from '@/hooks/usePatientDetail';
import { dailyNoteApi } from '@/lib/api/dailyNoteApi';
import type { DailyNoteDTO, MealInfo } from '@/types/dailyNote';

const { Option } = Select;

interface VisitDetailClientProps {
  visitId: string;
}

export default function VisitDetailClient({
  visitId,
}: VisitDetailClientProps) {
  const [visit, setVisit] = useState<VisitMaintenanceDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVisitDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getVisitDetail(visitId);
      
      if (response.success && response.data) {
        setVisit(response.data);
      } else {
        setError(response.message || 'Failed to load visit details');
      }
    } catch (err: unknown) {
      console.error('Failed to load visit detail:', err);
      setError((err as { message?: string })?.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [visitId]);

  useEffect(() => {
    loadVisitDetail();
  }, [loadVisitDetail]);

  const handleGenerateGroupCode = async () => {
    try {
      // TODO: Call API to generate group visit code
      console.log('Generating group visit code...');
    } catch (error) {
      console.error('Failed to generate group visit code:', error);
    }
  };

  // Tab Content Components
  const GeneralTab = () => {
    if (!visit) return null;
    
    return (
      <div className="mx-6 p-6 bg-white rounded">
        {/* Schedule Information */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm mb-1">Schedule In</label>
            <Input value={`${visit.visitDate} ${visit.scheduledTimeIn}`} readOnly />
        </div>
        <div>
          <label className="block text-sm mb-1">Schedule Out</label>
          <Input value={`${visit.visitDate} ${visit.scheduledTimeOut}`} readOnly />
        </div>
        <div>
          <label className="block text-sm mb-1">Schedule Hours</label>
          <Input value={visit.scheduledHours.toFixed(2)} readOnly />
        </div>
        <div>
          <label className="block text-sm mb-1">Visit Time Zone</label>
          <Select defaultValue="US/Eastern" style={{ width: '100%' }}>
            <Option value="US/Eastern">US/Eastern</Option>
            <Option value="US/Central">US/Central</Option>
            <Option value="US/Pacific">US/Pacific</Option>
          </Select>
        </div>
      </div>

      {/* Visit Dates */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm mb-1">Visit From Date</label>
          <Input placeholder="None" />
        </div>
        <div>
          <label className="block text-sm mb-1">Visit To Date</label>
          <Input placeholder="None" />
        </div>
        <div>
          <label className="block text-sm mb-1">Call In</label>
          <Input value={visit.callIn || 'None'} readOnly />
        </div>
        <div>
          <label className="block text-sm mb-1">Call Out</label>
          <Input value={visit.callOut || 'None'} readOnly />
        </div>
      </div>

      {/* Call Hours */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm mb-1">Call Hours</label>
          <Input value={visit.callHours ? visit.callHours.toFixed(2) : 'None'} readOnly />
        </div>
        <div>
          <label className="block text-sm mb-1">Adjusted In Date</label>
          <DatePicker format="MM/DD/YYYY" style={{ width: '100%' }} placeholder="MM/DD/YYYY" />
        </div>
        <div>
          <label className="block text-sm mb-1">Adjusted In</label>
          <Input placeholder="--:-- --" />
        </div>
        <div>
          <label className="block text-sm mb-1">Adjusted Out Date</label>
          <DatePicker format="MM/DD/YYYY" style={{ width: '100%' }} placeholder="MM/DD/YYYY" />
        </div>
      </div>

      {/* Adjusted Out */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm mb-1">Adjusted Out</label>
          <Input placeholder="--:-- --" />
        </div>
        <div>
          <label className="block text-sm mb-1">Agency ID</label>
          <Input value="229666" readOnly />
        </div>
        <div className="col-span-2">
          <label className="block text-sm mb-1">Agency Name</label>
          <Input value="BLUE ANGELS CARE LLC" readOnly />
        </div>
      </div>

      {/* Payer, Program, Service */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm mb-1">Payer</label>
          <Input value="PAODP" readOnly />
        </div>
        <div>
          <label className="block text-sm mb-1">Program</label>
          <Input value="ODP" readOnly />
        </div>
        <div className="col-span-2">
          <label className="block text-sm mb-1">Service</label>
          <Input value={visit.serviceName} readOnly />
        </div>
      </div>

      {/* Hours & Billing */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm mb-1">Bill Hours</label>
          <Input value={visit.billHours.toFixed(2)} readOnly />
        </div>
        <div>
          <label className="block text-sm mb-1">Pay Hours</label>
          <Input value={visit.payHours.toFixed(2)} readOnly />
        </div>
        <div>
          <label className="block text-sm mb-1">Group Visit Code</label>
          <Input placeholder="" />
        </div>
        <div>
          <label className="block text-sm mb-1">Visit Status</label>
          <div className="mt-1">
            <Tag color="blue">{visit.visitStatusDisplay}</Tag>
          </div>
        </div>
      </div>

      {/* Verification & Signatures */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm mb-1">Client Verified Time</label>
          <Select defaultValue="No" style={{ width: '100%' }}>
            <Option value="No">No</Option>
            <Option value="Yes">Yes</Option>
          </Select>
        </div>
        <div>
          <label className="block text-sm mb-1">Client Verified Service</label>
          <Select defaultValue="No" style={{ width: '100%' }}>
            <Option value="No">No</Option>
            <Option value="Yes">Yes</Option>
          </Select>
        </div>
        <div>
          <label className="block text-sm mb-1">Client Signature</label>
          <Select defaultValue="No" style={{ width: '100%' }}>
            <Option value="No">No</Option>
            <Option value="Yes">Yes</Option>
          </Select>
        </div>
        <div>
          <label className="block text-sm mb-1">Visit Source</label>
          <Input value="SANDATA" readOnly />
        </div>
      </div>

      {/* Schedule ID & Checkboxes */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm mb-1">Schedule ID</label>
          <Input value={visit.scheduleEventId} readOnly />
        </div>
        <div className="flex items-end">
          <Checkbox checked={visit.doNotBill}>Do Not Bill</Checkbox>
        </div>
        <div className="flex items-end">
          <Checkbox>Approved</Checkbox>
        </div>
        <div></div>
      </div>

      {/* Generate Group Visit Code Button */}
      <div className="flex justify-end">
        <Button
          icon={<CheckCircleOutlined />}
          onClick={handleGenerateGroupCode}
          style={{
            backgroundColor: '#0052cc',
            color: '#fff',
            borderColor: '#0052cc',
            fontWeight: 600
          }}
        >
          GENERATE GROUP VISIT CODE
        </Button>
      </div>
    </div>
    );
  };

  const ClientTab = () => {
    const [clientSearch, setClientSearch] = useState('');
    const { data: clientsData, isLoading: clientsLoading, error: clientsError } = useClients({ 
      search: clientSearch,
      size: 10
    });

    return (
      <div className="space-y-4">
        {/* Client Contact Information Section */}
        <div className="mx-6 p-6 bg-white rounded">
          <h3 className="text-lg font-semibold mb-4">Client Contact Information</h3>
          {visit ? (
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm mb-1 text-gray-600">Client ID</label>
                <div className="text-sm font-medium">{visit.clientId}</div>
              </div>
              <div className="col-span-2">
                <label className="block text-sm mb-1 text-gray-600">Client Name</label>
                <div className="text-sm font-medium">{visit.clientName}</div>
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-600">Status</label>
                <div className="text-sm"><Tag color="green">Active</Tag></div>
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-600">Medicaid ID</label>
                <div className="text-sm">{visit.clientMedicaidId || 'N/A'}</div>
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-600">Visit Date</label>
                <div className="text-sm">{visit.visitDate}</div>
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-600">Service</label>
                <div className="text-sm">{visit.serviceName}</div>
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-600">Service Code</label>
                <div className="text-sm">{visit.serviceCode || 'N/A'}</div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">No client information available</div>
          )}
        </div>

        {/* Find Client Section */}
        <div className="mx-6 p-6 bg-white rounded">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Find Client</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Search clients..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                style={{ width: 250 }}
              />
            </div>
          </div>
          {clientsLoading ? (
            <div className="text-center py-8 text-gray-500">Loading clients...</div>
          ) : clientsError ? (
            <div className="text-center py-8 text-red-500">
              Failed to load clients: {clientsError.message || 'Unknown error'}
            </div>
          ) : !clientsData?.content || clientsData.content.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No clients found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-semibold text-sm">CLIENT ID</th>
                    <th className="text-left py-3 px-2 font-semibold text-sm">CLIENT NAME</th>
                    <th className="text-left py-3 px-2 font-semibold text-sm">MEDICAID ID</th>
                    <th className="text-left py-3 px-2 font-semibold text-sm">STATUS</th>
                    <th className="text-left py-3 px-2 font-semibold text-sm">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {clientsData.content.map((client) => (
                    <tr 
                      key={client.id} 
                      className={`border-b hover:bg-gray-50 ${client.id === visit?.clientId ? 'bg-blue-50' : ''}`}
                    >
                      <td className="py-3 px-2 text-sm">{client.id}</td>
                      <td className="py-3 px-2 text-sm">{client.clientName}</td>
                      <td className="py-3 px-2 text-sm">{client.medicaidId || 'N/A'}</td>
                      <td className="py-3 px-2 text-sm">
                        <Tag color={client.status === 'ACTIVE' ? 'green' : 'default'}>
                          {client.status || 'ACTIVE'}
                        </Tag>
                      </td>
                      <td className="py-3 px-2 text-sm">
                        <Button 
                          type="link" 
                          size="small" 
                          onClick={() => window.open(`/dashboard/clients/${client.id}`, '_blank')}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  const EmployeeTab = () => {
    const [employeeSearch, setEmployeeSearch] = useState('');
    const { data: employeesData, isLoading: employeesLoading, error: employeesError } = useEmployees({ 
      search: employeeSearch,
      size: 10
    });

    return (
      <div className="space-y-4">
        {/* Employee Contact Information Section */}
        <div className="mx-6 p-6 bg-white rounded">
          <h3 className="text-lg font-semibold mb-4">Employee Contact Information</h3>
          {visit ? (
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm mb-1 text-gray-600">Employee ID</label>
                <div className="text-sm font-medium">{visit.employeeId}</div>
              </div>
              <div className="col-span-2">
                <label className="block text-sm mb-1 text-gray-600">Employee Name</label>
                <div className="text-sm font-medium">{visit.employeeName}</div>
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-600">Status</label>
                <div className="text-sm"><Tag color="blue">Active</Tag></div>
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-600">Employee Code</label>
                <div className="text-sm">{visit.employeeCode || 'N/A'}</div>
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-600">Visit Date</label>
                <div className="text-sm">{visit.visitDate}</div>
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-600">Service</label>
                <div className="text-sm">{visit.serviceName}</div>
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-600">Scheduled Hours</label>
                <div className="text-sm">{visit.scheduledHours.toFixed(2)}</div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">No employee information available</div>
          )}
        </div>

        {/* Find Employee Section */}
        <div className="mx-6 p-6 bg-white rounded">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Find Employee</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Search employees..."
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
                style={{ width: 250 }}
              />
            </div>
          </div>
          {employeesLoading ? (
            <div className="text-center py-8 text-gray-500">Loading employees...</div>
          ) : employeesError ? (
            <div className="text-center py-8 text-red-500">
              Failed to load employees: {employeesError.message || 'Unknown error'}
            </div>
          ) : !employeesData?.content || employeesData.content.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No employees found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-semibold text-sm">EMPLOYEE ID</th>
                    <th className="text-left py-3 px-2 font-semibold text-sm">EMPLOYEE NAME</th>
                    <th className="text-left py-3 px-2 font-semibold text-sm">EMPLOYEE CODE</th>
                    <th className="text-left py-3 px-2 font-semibold text-sm">STATUS</th>
                    <th className="text-left py-3 px-2 font-semibold text-sm">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {employeesData.content.map((employee) => (
                    <tr 
                      key={employee.id} 
                      className={`border-b hover:bg-gray-50 ${employee.id === visit?.employeeId ? 'bg-blue-50' : ''}`}
                    >
                      <td className="py-3 px-2 text-sm">{employee.id}</td>
                      <td className="py-3 px-2 text-sm">{employee.name}</td>
                      <td className="py-3 px-2 text-sm">{employee.employeeId || 'N/A'}</td>
                      <td className="py-3 px-2 text-sm">
                        <Tag color={employee.status === 'ACTIVE' ? 'blue' : 'default'}>
                          {employee.status || 'ACTIVE'}
                        </Tag>
                      </td>
                      <td className="py-3 px-2 text-sm">
                        <Button 
                          type="link" 
                          size="small" 
                          onClick={() => window.open(`/dashboard/employees/${employee.id}`, '_blank')}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Calculate distance between two GPS coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const GPSTab = () => {
    const { data: clientData, isLoading: clientLoading, error: clientError } = usePatientPersonal(
      visit?.clientId || '',
      { enabled: !!visit?.clientId }
    );

    const mainAddress = clientData?.addresses?.find(addr => addr.isMain);
    const hasClientGPS = mainAddress?.latitude && mainAddress?.longitude;
    
    const checkInEvent = visit?.checkInEvent;
    const checkOutEvent = visit?.checkOutEvent;
    const hasCheckInGPS = checkInEvent?.latitude && checkInEvent?.longitude;
    const hasCheckOutGPS = checkOutEvent?.latitude && checkOutEvent?.longitude;

    // Calculate distances
    let checkInDistance: number | null = null;
    let checkOutDistance: number | null = null;
    
    if (hasClientGPS && hasCheckInGPS) {
      checkInDistance = calculateDistance(
        mainAddress.latitude!,
        mainAddress.longitude!,
        checkInEvent.latitude!,
        checkInEvent.longitude!
      );
    }
    
    if (hasClientGPS && hasCheckOutGPS) {
      checkOutDistance = calculateDistance(
        mainAddress.latitude!,
        mainAddress.longitude!,
        checkOutEvent.latitude!,
        checkOutEvent.longitude!
      );
    }

    // Determine if there's a GPS exception (employee > 100m from client)
    const checkInException = checkInDistance !== null && (checkInDistance > 100 || checkInEvent?.status === 'GPS_MISMATCH');
    const checkOutException = checkOutDistance !== null && (checkOutDistance > 100 || checkOutEvent?.status === 'GPS_MISMATCH');

    return (
      <div className="mx-6 p-6 bg-white rounded">
        <h3 className="text-lg font-semibold mb-4">GPS Location Tracking</h3>
        
        {clientLoading ? (
          <div className="min-h-[500px] flex items-center justify-center text-gray-500">
            Loading location data...
          </div>
        ) : clientError ? (
          <div className="min-h-[500px] flex items-center justify-center text-red-500">
            Failed to load location: {clientError.message || 'Unknown error'}
          </div>
        ) : !hasClientGPS ? (
          <div className="min-h-[500px] flex flex-col items-center justify-center text-gray-400">
            <div className="text-lg mb-2">No GPS coordinates available</div>
            <div className="text-sm">Client address does not have GPS coordinates</div>
          </div>
        ) : (
          <div>
            {/* GPS Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              {/* Client Location */}
              <div className={`p-4 rounded border-2 ${hasClientGPS ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-300'}`}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700">📍 Client Location</label>
                  {hasClientGPS && <Tag color="blue">GPS Available</Tag>}
                </div>
                <div className="text-xs text-gray-600 mb-2">
                  {mainAddress.line1}
                  {mainAddress.line2 && `, ${mainAddress.line2}`}
                </div>
                {hasClientGPS && (
                  <div className="text-xs">
                    <div>Lat: {mainAddress.latitude?.toFixed(6)}</div>
                    <div>Lon: {mainAddress.longitude?.toFixed(6)}</div>
                  </div>
                )}
              </div>

              {/* Check-In Location */}
              <div className={`p-4 rounded border-2 ${
                checkInException ? 'bg-red-50 border-red-300' : 
                hasCheckInGPS ? 'bg-green-50 border-green-300' : 
                'bg-gray-50 border-gray-300'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700">📱 Check-In Location</label>
                  {hasCheckInGPS ? (
                    checkInException ? (
                      <Tag color="red">GPS Exception</Tag>
                    ) : (
                      <Tag color="green">GPS OK</Tag>
                    )
                  ) : (
                    <Tag color="default">No GPS</Tag>
                  )}
                </div>
                {hasCheckInGPS ? (
                  <>
                    <div className="text-xs mb-2">
                      <div>Lat: {checkInEvent.latitude?.toFixed(6)}</div>
                      <div>Lon: {checkInEvent.longitude?.toFixed(6)}</div>
                    </div>
                    {checkInDistance !== null && (
                      <div className={`text-xs font-semibold ${checkInException ? 'text-red-600' : 'text-green-600'}`}>
                        Distance: {checkInDistance.toFixed(0)}m from client
                      </div>
                    )}
                    {checkInEvent.accuracyMeters && (
                      <div className="text-xs text-gray-500">Accuracy: ±{checkInEvent.accuracyMeters.toFixed(0)}m</div>
                    )}
                  </>
                ) : (
                  <div className="text-xs text-gray-500">Employee has not checked in yet</div>
                )}
              </div>

              {/* Check-Out Location */}
              <div className={`p-4 rounded border-2 ${
                checkOutException ? 'bg-red-50 border-red-300' : 
                hasCheckOutGPS ? 'bg-green-50 border-green-300' : 
                'bg-gray-50 border-gray-300'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700">📱 Check-Out Location</label>
                  {hasCheckOutGPS ? (
                    checkOutException ? (
                      <Tag color="red">GPS Exception</Tag>
                    ) : (
                      <Tag color="green">GPS OK</Tag>
                    )
                  ) : (
                    <Tag color="default">No GPS</Tag>
                  )}
                </div>
                {hasCheckOutGPS ? (
                  <>
                    <div className="text-xs mb-2">
                      <div>Lat: {checkOutEvent.latitude?.toFixed(6)}</div>
                      <div>Lon: {checkOutEvent.longitude?.toFixed(6)}</div>
                    </div>
                    {checkOutDistance !== null && (
                      <div className={`text-xs font-semibold ${checkOutException ? 'text-red-600' : 'text-green-600'}`}>
                        Distance: {checkOutDistance.toFixed(0)}m from client
                      </div>
                    )}
                    {checkOutEvent.accuracyMeters && (
                      <div className="text-xs text-gray-500">Accuracy: ±{checkOutEvent.accuracyMeters.toFixed(0)}m</div>
                    )}
                  </>
                ) : (
                  <div className="text-xs text-gray-500">Employee has not checked out yet</div>
                )}
              </div>
            </div>

            {/* Map Display */}
            <div className="relative w-full mb-4" style={{ height: '500px' }}>
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${mainAddress.latitude},${mainAddress.longitude}&zoom=17`}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                type="primary"
                onClick={() => {
                  let url = `https://www.google.com/maps?q=${mainAddress.latitude},${mainAddress.longitude}`;
                  if (hasCheckInGPS) {
                    url += `&markers=color:green%7Clabel:IN%7C${checkInEvent.latitude},${checkInEvent.longitude}`;
                  }
                  if (hasCheckOutGPS) {
                    url += `&markers=color:red%7Clabel:OUT%7C${checkOutEvent.latitude},${checkOutEvent.longitude}`;
                  }
                  window.open(url, '_blank');
                }}
              >
                View All Locations in Google Maps
              </Button>
              <Button
                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${mainAddress.latitude},${mainAddress.longitude}`, '_blank')}
              >
                Get Directions to Client
              </Button>
            </div>

            {/* GPS Exception Warning */}
            {(checkInException || checkOutException) && (
              <div className="mt-4 p-4 bg-red-50 border-2 border-red-300 rounded">
                <div className="flex items-start gap-2">
                  <span className="text-red-600 text-xl">⚠️</span>
                  <div>
                    <div className="font-semibold text-red-700 mb-1">GPS Exception Detected</div>
                    <div className="text-sm text-red-600">
                      {checkInException && checkOutException ? (
                        <>Both check-in and check-out locations are more than 100 meters away from the client address.</>
                      ) : checkInException ? (
                        <>Check-in location is {checkInDistance?.toFixed(0)}m away from the client address (exceeds 100m threshold).</>
                      ) : (
                        <>Check-out location is {checkOutDistance?.toFixed(0)}m away from the client address (exceeds 100m threshold).</>
                      )}
                      <br />
                      This visit may require manual verification.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const MemoTab = () => {
    const [dailyNote, setDailyNote] = useState<DailyNoteDTO | null>(null);
    const [loadingNote, setLoadingNote] = useState(false);
    const [noteError, setNoteError] = useState<string | null>(null);
    const dailyNoteId = visit?.dailyNoteId;

    const loadDailyNote = useCallback(async () => {
      if (!dailyNoteId) return;
      
      setLoadingNote(true);
      setNoteError(null);
      try {
        const note = await dailyNoteApi.getDailyNoteById(dailyNoteId);
        setDailyNote(note);
      } catch (err: unknown) {
        console.error('Failed to load daily note:', err);
        setNoteError((err as { message?: string })?.message || 'Failed to load daily note');
      } finally {
        setLoadingNote(false);
      }
    }, [dailyNoteId]);

    useEffect(() => {
      if (dailyNoteId) {
        loadDailyNote();
      }
    }, [dailyNoteId, loadDailyNote]);

    const hasDailyNote = visit?.dailyNoteId && dailyNote;

    return (
      <div className="mx-6 p-6 bg-white rounded">
        <h3 className="text-lg font-semibold mb-4">Daily Note / Memo</h3>
        
        {loadingNote ? (
          <div className="min-h-[400px] flex items-center justify-center text-gray-500">
            Loading daily note...
          </div>
        ) : noteError ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center text-center text-red-500">
            <div className="text-lg mb-2">Failed to Load Daily Note</div>
            <div className="text-sm">{noteError}</div>
          </div>
        ) : hasDailyNote ? (
          <div className="space-y-6">
            {/* Header with Status Tags */}
            <div className="flex items-center gap-2 flex-wrap">
              <Tag color="green">Daily Note Available</Tag>
              {dailyNote.patientSignature && <Tag color="blue" icon={<CheckCircleOutlined />}>Patient Signed</Tag>}
              {dailyNote.staffSignature && <Tag color="purple" icon={<CheckCircleOutlined />}>Staff Signed</Tag>}
              {dailyNote.cancelled && <Tag color="red">Cancelled</Tag>}
            </div>

            {/* Note Content */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Note Content:</label>
              <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                {dailyNote.content || 'No content provided'}
              </div>
            </div>

            {/* Author Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded p-3">
                <label className="block text-sm font-semibold text-gray-600 mb-1">Client:</label>
                <div className="text-sm">{dailyNote.patientName}</div>
              </div>
              <div className="bg-gray-50 rounded p-3">
                <label className="block text-sm font-semibold text-gray-600 mb-1">Staff:</label>
                <div className="text-sm">{dailyNote.staffName}</div>
              </div>
            </div>

            {/* Check In/Out Times */}
            {(dailyNote.checkInTime || dailyNote.checkOutTime) && (
              <div className="grid grid-cols-2 gap-4">
                {dailyNote.checkInTime && (
                  <div className="bg-green-50 rounded p-3 border border-green-200">
                    <label className="block text-sm font-semibold text-green-700 mb-1">Check-In Time:</label>
                    <div className="text-sm">{new Date(dailyNote.checkInTime).toLocaleString()}</div>
                  </div>
                )}
                {dailyNote.checkOutTime && (
                  <div className="bg-red-50 rounded p-3 border border-red-200">
                    <label className="block text-sm font-semibold text-red-700 mb-1">Check-Out Time:</label>
                    <div className="text-sm">{new Date(dailyNote.checkOutTime).toLocaleString()}</div>
                  </div>
                )}
              </div>
            )}

            {/* Meal Information */}
            {dailyNote.mealInfo && dailyNote.mealInfo.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <label className="block text-sm font-semibold text-blue-700 mb-3">Meal Information:</label>
                <div className="space-y-3">
                  {dailyNote.mealInfo.map((meal: MealInfo, index: number) => (
                    <div key={index} className="bg-white rounded p-3 border border-blue-100">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {meal.meal && (
                          <div>
                            <span className="font-semibold text-gray-600">Meal: </span>
                            <span>{meal.meal}</span>
                          </div>
                        )}
                        {meal.time && (
                          <div>
                            <span className="font-semibold text-gray-600">Time: </span>
                            <span>{meal.time}</span>
                          </div>
                        )}
                        {meal.offered && (
                          <div>
                            <span className="font-semibold text-gray-600">Offered: </span>
                            <span>{meal.offered}</span>
                          </div>
                        )}
                        {meal.ate && (
                          <div>
                            <span className="font-semibold text-gray-600">Ate: </span>
                            <span>{meal.ate}</span>
                          </div>
                        )}
                        {meal.mealType && (
                          <div>
                            <span className="font-semibold text-gray-600">Type: </span>
                            <span>{meal.mealType}</span>
                          </div>
                        )}
                        {meal.whatOffered && (
                          <div className="col-span-2">
                            <span className="font-semibold text-gray-600">What Offered: </span>
                            <span>{meal.whatOffered}</span>
                          </div>
                        )}
                        {meal.whatHad && (
                          <div className="col-span-2">
                            <span className="font-semibold text-gray-600">What Had: </span>
                            <span>{meal.whatHad}</span>
                          </div>
                        )}
                        {meal.notes && (
                          <div className="col-span-2">
                            <span className="font-semibold text-gray-600">Notes: </span>
                            <span>{meal.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Signatures */}
            {(dailyNote.patientSignature || dailyNote.staffSignature) && (
              <div className="grid grid-cols-2 gap-4">
                {dailyNote.patientSignature && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Patient Signature:</label>
                    <div className="relative max-h-32 w-full border border-gray-300 rounded bg-white p-2">
                      <Image 
                        src={dailyNote.patientSignature} 
                        alt="Patient Signature" 
                        width={400}
                        height={128}
                        className="w-full h-auto object-contain"
                        unoptimized
                      />
                    </div>
                  </div>
                )}
                {dailyNote.staffSignature && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Staff Signature:</label>
                    <div className="relative max-h-32 w-full border border-gray-300 rounded bg-white p-2">
                      <Image 
                        src={dailyNote.staffSignature} 
                        alt="Staff Signature" 
                        width={400}
                        height={128}
                        className="w-full h-auto object-contain"
                        unoptimized
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cancel Information */}
            {dailyNote.cancelled && dailyNote.cancelReason && (
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <label className="block text-sm font-semibold text-red-700 mb-2">Cancel Reason:</label>
                <div className="text-sm text-red-600">{dailyNote.cancelReason}</div>
              </div>
            )}

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
              {dailyNote.createdAt && (
                <div>
                  <span className="font-semibold">Created: </span>
                  <span>{new Date(dailyNote.createdAt).toLocaleString()}</span>
                </div>
              )}
              {dailyNote.updatedAt && (
                <div>
                  <span className="font-semibold">Updated: </span>
                  <span>{new Date(dailyNote.updatedAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="min-h-[400px] flex flex-col items-center justify-center text-center text-gray-400">
            <div className="text-6xl mb-4">📝</div>
            <div className="text-lg mb-2">No Daily Note Available</div>
            <div className="text-sm">No daily note has been created for this visit yet.</div>
          </div>
        )}
      </div>
    );
  };

  const PlaceholderTab = () => (
    <div className="mx-6 p-6 bg-white rounded">
      <div className="min-h-[400px] flex items-center justify-center text-center text-gray-400 text-base">
        No Data Found
      </div>
    </div>
  );

  // Tab items configuration
  const tabItems = [
    {
      key: 'general',
      label: 'General',
      children: <GeneralTab />,
    },
    {
      key: 'client',
      label: 'Client',
      children: <ClientTab />,
    },
    {
      key: 'employee',
      label: 'Employee',
      children: <EmployeeTab />,
    },
    {
      key: 'authorizations',
      label: 'Authorizations',
      children: <PlaceholderTab />,
    },
    {
      key: 'callLog',
      label: 'Call Log',
      children: <PlaceholderTab />,
    },
    {
      key: 'mergeCalls',
      label: 'Merge Calls',
      children: <PlaceholderTab />,
    },
    {
      key: 'exceptions',
      label: 'Exceptions',
      children: <PlaceholderTab />,
    },
    {
      key: 'gps',
      label: 'GPS',
      children: <GPSTab />,
    },
    {
      key: 'memo',
      label: 'Memo',
      children: <MemoTab />,
    },
    {
      key: 'claims',
      label: 'Claims',
      children: <PlaceholderTab />,
    },
    {
      key: 'history',
      label: 'History',
      children: <PlaceholderTab />,
    },
  ];

  if (loading) {
    return <LoadingFallback message="Loading visit details..." />;
  }

  if (error || !visit) {
    return (
      <InlineError
        title="Unable to Load Visit"
        message={error || 'Visit not found'}
      />
    );
  }

  return (
    <div className="w-full mx-auto p-0 min-h-[calc(100vh-64px)] flex flex-col bg-[var(--bg-surface)]">
      {/* Visit Header - Always visible across all tabs */}
      <VisitHeader visit={visit} />

      {/* Tabs for different sections */}
      <div className="flex-1 flex flex-col">
        <div className="mx-6 mt-4">
          <Tabs
            defaultActiveKey="general"
            items={tabItems}
            className="w-full flex-1 flex flex-col"
          />
        </div>
      </div>
    </div>
  );
}
