# Table Layout Module Usage Guide

## Overview

The `table-layout.module.css` provides a reusable layout pattern for pages that display data tables with control bars (filters, search, actions).

## Location

```
frontend/src/styles/table-layout.module.css
```

## Features

- ✅ **Responsive design** - Mobile-friendly layout
- ✅ **Flexbox-based** - Flexible and scalable
- ✅ **Theme-aware** - Uses CSS variables for dark/light mode
- ✅ **Ant Design compatible** - Works seamlessly with Ant Design components
- ✅ **Reusable** - One import for consistent table layouts

---

## Available Classes

### `.pageContainer`

Main wrapper for the entire page. Sets up full-height layout with proper overflow handling.

```tsx
<div className={layoutStyles.pageContainer}>{/* Your page content */}</div>
```

### `.controlBar`

Top control bar for filters, search, and action buttons. Use with Ant Design's `Card` component.

```tsx
<Card className={layoutStyles.controlBar} variant="borderless">
  {/* Filters, search, buttons */}
</Card>
```

### `.controlsRow`

Horizontal flexbox row for organizing controls. Automatically wraps on smaller screens.

```tsx
<div className={layoutStyles.controlsRow}>
  <Button>Left Button</Button>
  <Space className={layoutStyles.rightControls}>
    {/* Right-aligned controls */}
  </Space>
</div>
```

### `.rightControls`

Right-aligned group of controls (search, filters, export buttons).

```tsx
<Space size="middle" className={layoutStyles.rightControls}>
  <Input placeholder="Search..." />
  <Button>Filter</Button>
  <Button>Export</Button>
</Space>
```

### `.tableCard`

Wrapper card for the data table. Handles flex layout and overflow properly.

```tsx
<Card className={layoutStyles.tableCard} variant="borderless">
  <Table {...tableProps} />
</Card>
```

---

## Complete Example

```tsx
"use client";

import React from "react";
import { Card, Table, Input, Button, Space } from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import layoutStyles from "@/styles/table-layout.module.css";
import buttonStyles from "@/styles/buttons.module.css";

export default function MyDataPage() {
  return (
    <div className={layoutStyles.pageContainer}>
      {/* Control Bar */}
      <Card className={layoutStyles.controlBar} variant="borderless">
        <div className={layoutStyles.controlsRow}>
          {/* Left: Primary action */}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className={buttonStyles.createButton}
          >
            CREATE NEW
          </Button>

          {/* Right: Search and filters */}
          <Space size="middle" className={layoutStyles.rightControls}>
            <Input
              placeholder="Search..."
              prefix={<SearchOutlined />}
              className={layoutStyles.searchInput}
              allowClear
            />
            <Button
              icon={<FilterOutlined />}
              className={buttonStyles.actionButton}
            >
              FILTERS
            </Button>
          </Space>
        </div>
      </Card>

      {/* Table Card */}
      <Card className={layoutStyles.tableCard} variant="borderless">
        <Table
          columns={columns}
          dataSource={data}
          pagination={{
            position: ["bottomCenter"],
            showSizeChanger: true,
          }}
          scroll={{
            x: 1200,
            y: "calc(100vh - 280px)",
          }}
        />
      </Card>
    </div>
  );
}
```

---

## Responsive Behavior

### Desktop (> 1024px)

- Controls in a single horizontal row
- Right controls aligned to the right
- Full padding (12px)

### Tablet/Mobile (≤ 1024px)

- Controls stack vertically
- Search input takes full width
- Increased padding (16px)
- Right controls align to the left

---

## Customization

### Override Specific Classes

If you need page-specific customizations, create a local module and override:

```css
/* my-page.module.css */
.customContainer {
  composes: pageContainer from "@/styles/table-layout.module.css";
  padding: 24px; /* Override padding */
}
```

### Theme Variables

The layout uses these CSS variables (defined in `globals.css`):

- `--bg-primary` - Main background color
- `--bg-surface` - Card/surface background
- `--border-color` - Border color

---

## Files Structure

```
frontend/src/
├── styles/
│   ├── table-layout.module.css  ← Layout classes (NEW)
│   ├── buttons.module.css       ← Button styles
│   └── antd-overrides.css       ← Ant Design customizations
└── app/
    └── clients/
        ├── ClientsClient.tsx    ← Uses layoutStyles
        └── clients.module.css   ← Page-specific styles only
```

---

## Benefits

### Before (Page-specific CSS)

❌ Duplicate layout code in every page  
❌ Inconsistent spacing and structure  
❌ Hard to maintain  
❌ Large CSS files

### After (Shared Layout Module)

✅ Single source of truth for table layouts  
✅ Consistent design across all pages  
✅ Easy to maintain and update  
✅ Smaller page-specific CSS files  
✅ Faster development (import and use)

---

## Migration Guide

### For Existing Pages

1. **Import the layout module:**

   ```tsx
   import layoutStyles from "@/styles/table-layout.module.css";
   ```

2. **Replace old classes:**

   ```tsx
   // Before
   <div className={styles.clientsContainer}>

   // After
   <div className={layoutStyles.pageContainer}>
   ```

3. **Keep page-specific styles:**
   Only keep truly unique styles in your page's CSS module (e.g., custom hover effects, specific colors).

---

## Related Files

- **Table styling:** `frontend/src/styles/antd-overrides.css`
- **Button styling:** `frontend/src/styles/buttons.module.css`
- **Theme variables:** `frontend/src/app/globals.css`

---

## Support

For questions or issues with the layout module, check:

1. This documentation
2. The `clients` page implementation (reference example)
3. Frontend instructions: `.github/instructions/frontend.instructions.md`
