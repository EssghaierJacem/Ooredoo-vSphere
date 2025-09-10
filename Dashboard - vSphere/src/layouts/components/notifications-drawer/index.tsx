import type { IconButtonProps } from '@mui/material/IconButton';

import { m } from 'framer-motion';
import { useState, useCallback } from 'react';
import { useBoolean } from 'minimal-shared/hooks';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import { varTap, varHover, transitionTap } from 'src/components/animate';

import { NotificationItem } from './notification-item';

import type { NotificationItemProps } from './notification-item';

// ----------------------------------------------------------------------

const TABS = [
  { value: 'all', label: 'All', count: 22 },
  { value: 'unread', label: 'Unread', count: 12 },
  { value: 'archived', label: 'Archived', count: 10 },
];

// ----------------------------------------------------------------------

export type NotificationsDrawerProps = IconButtonProps & {
  data?: NotificationItemProps['notification'][];
  onSeen?: (id: string) => void;
  onClearAll?: () => void;
  tabData?: {
    [key: string]: NotificationItemProps['notification'][];
    all: NotificationItemProps['notification'][];
    unread: NotificationItemProps['notification'][];
    archived: NotificationItemProps['notification'][];
  };
};

export function NotificationsDrawer({ data = [], sx, onSeen, onClearAll, tabData, ...other }: NotificationsDrawerProps) {
  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();

  const [currentTab, setCurrentTab] = useState<'all' | 'unread' | 'archived'>('all');

  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue as 'all' | 'unread' | 'archived');
  }, []);

  // Use tabData if provided, else fallback to data
  const notifications: NotificationItemProps['notification'][] = tabData && tabData[currentTab] ? tabData[currentTab] : data;

  const totalUnRead = tabData ? tabData.unread.length : (data.filter((item) => item.isUnRead === true).length);

  const handleMarkAllAsRead = () => {
    if (onClearAll) onClearAll();
  };

  const renderHead = () => (
    <Box
      sx={{
        py: 2,
        pr: 1,
        pl: 2.5,
        minHeight: 68,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        Notifications
      </Typography>

      {!!totalUnRead && (
        <Tooltip title="Mark all as seen">
          <IconButton color="primary" onClick={handleMarkAllAsRead}>
            <Iconify icon="eva:checkmark-circle-2-outline" />
          </IconButton>
        </Tooltip>
      )}

      <IconButton onClick={onClose} sx={{ display: { xs: 'inline-flex', sm: 'none' } }}>
        <Iconify icon="mingcute:close-line" />
      </IconButton>

      <IconButton>
        <Iconify icon="solar:settings-bold-duotone" />
      </IconButton>
    </Box>
  );

  const renderTabs = () => (
    <CustomTabs variant="fullWidth" value={currentTab} onChange={handleChangeTab}>
      <Tab
        key="all"
        iconPosition="end"
        value="all"
        label="All"
        icon={<Label variant={(currentTab === 'all' && 'filled') || 'soft'}>{tabData ? tabData.all.length : data.length}</Label>}
      />
      <Tab
        key="unread"
        iconPosition="end"
        value="unread"
        label="Unread"
        icon={<Label variant={(currentTab === 'unread' && 'filled') || 'soft'} color="info">{tabData ? tabData.unread.length : 0}</Label>}
      />
      <Tab
        key="archived"
        iconPosition="end"
        value="archived"
        label="Archived"
        icon={<Label variant={(currentTab === 'archived' && 'filled') || 'soft'} color="success">{tabData ? tabData.archived.length : 0}</Label>}
      />
    </CustomTabs>
  );

  const renderList = () => (
    <Scrollbar>
      <Box component="ul">
        {notifications?.map((notification: NotificationItemProps['notification']) => (
          <Box component="li" key={notification.id} sx={{ display: 'flex', alignItems: 'center' }}>
            <NotificationItem notification={notification} />
            {onSeen && (
              <Button size="small" onClick={() => onSeen(notification.id)} sx={{ ml: 1 }}>
                {notification.isUnRead ? 'Seen' : 'Unseen'}
              </Button>
            )}
          </Box>
        ))}
      </Box>
    </Scrollbar>
  );

  return (
    <>
      <IconButton
        component={m.button}
        whileTap={varTap(0.96)}
        whileHover={varHover(1.04)}
        transition={transitionTap()}
        aria-label="Notifications button"
        onClick={onOpen}
        sx={sx}
        {...other}
      >
        <Badge badgeContent={totalUnRead} color="error">
          <Iconify width={24} icon="solar:bell-bing-bold-duotone" />
        </Badge>
      </IconButton>

      <Drawer
        open={open}
        onClose={onClose}
        anchor="right"
        slotProps={{
          backdrop: { invisible: true },
          paper: { sx: { width: 1, maxWidth: 420 } },
        }}
      >
        {renderHead()}
        {renderTabs()}
        {renderList()}

        <Box sx={{ p: 1 }}>
          <Button fullWidth size="large" href="/dashboard/two" component="a">
            View all
          </Button>
        </Box>
      </Drawer>
    </>
  );
}
