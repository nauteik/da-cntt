# BFF (Backend for Frontend) Pattern

## Vấn đề

Khi sử dụng Server-Side Rendering (SSR) với Next.js và backend API riêng biệt trên các domain khác nhau:
- Frontend: `da-cntt.vercel.app` (Vercel)
- Backend: `da-cntt.fly.dev` (Fly.io)

**Server Components không thể gửi cookie cross-domain** để authenticate với backend API.

## Giải pháp: BFF Pattern

Tạo API Routes trong Next.js làm proxy layer giữa Server Components và Backend API.

```
Browser → Next.js Server (Vercel) → Backend API (Fly.io)
         ↑ Cookie stored here   ↑ Forward cookie
```

## Cách hoạt động

### 1. Browser gửi request đến Next.js page
```typescript
// User visits: https://da-cntt.vercel.app/clients
// Browser tự động gửi cookie `accessToken` trong request
```

### 2. Server Component gọi Next.js API Route (BFF)
```typescript
// frontend/src/app/clients/page.tsx
async function getActiveOffices() {
  // Call Next.js API route (same domain)
  const response = await fetch('http://localhost:3000/api/offices/active');
  return response.json();
}
```

### 3. Next.js API Route forward cookie đến Backend
```typescript
// frontend/src/app/api/offices/active/route.ts
export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken');
  
  // Forward to backend with cookie
  const response = await fetch('https://da-cntt.fly.dev/api/office/active', {
    headers: {
      Cookie: `accessToken=${accessToken.value}`,
    },
  });
  
  return response.json();
}
```

### 4. Backend API xác thực và trả về data
```java
// Backend kiểm tra JWT token trong cookie
// Trả về data nếu authenticated
```

## Ưu điểm

✅ **Giữ được Server-Side Rendering**
- Initial page load nhanh
- SEO friendly
- Hydration optimization

✅ **Bảo mật tốt hơn**
- Cookie HttpOnly không expose ra client
- Sensitive data không bị leak
- Có thể thêm rate limiting, caching ở BFF layer

✅ **Flexibility**
- Có thể transform data trước khi trả về client
- Có thể aggregate multiple backend calls
- Có thể cache ở Next.js layer

✅ **Type Safety**
- Sử dụng cùng TypeScript types
- IDE autocomplete
- Compile-time checking

## Nhược điểm

⚠️ **Thêm một layer**
- Tăng latency một chút (thêm một hop)
- Cần maintain thêm API routes

⚠️ **Duplicate endpoints**
- Mỗi backend endpoint cần một API route tương ứng
- Cần sync changes giữa backend và BFF

## Implemented BFF Routes

### 1. GET /api/offices/active
Fetch active offices for authenticated users.

### 2. POST /api/auth/logout
Properly clear HttpOnly cookies (cannot be done from client-side JavaScript).

**Why logout needs BFF:**
- HttpOnly cookies cannot be deleted via JavaScript
- Only server-side code (Next.js API route) can delete HttpOnly cookies
- Ensures cookie is completely removed before redirect

## Khi nào sử dụng

**Nên dùng BFF khi:**
- Cần SSR với authenticated APIs
- Frontend và Backend trên domain khác nhau
- Cần transform/aggregate data từ backend
- Cần thêm caching layer
- Cần xóa HttpOnly cookies (logout)

**Không cần BFF khi:**
- Frontend và Backend cùng domain (subdomain)
- Chỉ dùng Client-Side Rendering
- Không cần authentication cho SSR

## Environment Variables

### Development (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Production (Vercel)
```bash
NEXT_PUBLIC_API_URL=https://da-cntt.fly.dev
NEXT_PUBLIC_SITE_URL=https://da-cntt.vercel.app
```

## Best Practices

1. **Cache appropriately**
   ```typescript
   fetch(url, { cache: 'no-store' }) // User-specific data
   fetch(url, { next: { revalidate: 300 } }) // Public data (5 min cache)
   ```

2. **Error handling**
   ```typescript
   try {
     const response = await fetch(backendUrl);
     if (!response.ok) {
       return NextResponse.json({ error: 'Backend error' }, { status: 502 });
     }
   } catch (error) {
     return NextResponse.json({ error: 'Network error' }, { status: 503 });
   }
   ```

3. **Type safety**
   ```typescript
   import type { ApiResponse } from '@/types/api';
   const data: ApiResponse<OfficeDTO[]> = await response.json();
   ```

4. **Logging**
   ```typescript
   console.log('[BFF] Fetching offices for user:', userId);
   ```

## Alternative Solutions

### Option 1: Client-Side Only
Chuyển tất cả data fetching sang client-side với React Query.
- ✅ Đơn giản
- ❌ Mất lợi ích SSR

### Option 2: Custom Domain
Deploy frontend và backend dưới cùng root domain.
- ✅ Không cần BFF
- ❌ Cần setup custom domain

### Option 3: Reverse Proxy
Dùng nginx/traefik để route requests.
- ✅ Professional
- ❌ Phức tạp hơn

## Kết luận

BFF Pattern là **best practice** để giữ SSR với authenticated APIs khi frontend và backend trên domain khác nhau. Nó cân bằng tốt giữa performance, security, và developer experience.

