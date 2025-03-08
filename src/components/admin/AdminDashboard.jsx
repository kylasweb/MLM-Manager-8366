import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import {
  UserOutlined,
  BankOutlined,
  AppstoreOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import UserManagement from './UserManagement';
import InvestmentManagement from './InvestmentManagement';
import PoolManagement from './PoolManagement';
import SystemSettings from './SystemSettings';

const { Content, Sider } = Layout;

const AdminDashboard = () => {
  const [selectedKey, setSelectedKey] = useState('1');

  const menuItems = [
    {
      key: '1',
      icon: <UserOutlined />,
      label: 'User Management',
    },
    {
      key: '2',
      icon: <BankOutlined />,
      label: 'Investment Plans',
    },
    {
      key: '3',
      icon: <AppstoreOutlined />,
      label: 'Pool Management',
    },
    {
      key: '4',
      icon: <SettingOutlined />,
      label: 'System Settings',
    },
  ];

  const renderContent = () => {
    switch (selectedKey) {
      case '1':
        return <UserManagement />;
      case '2':
        return <InvestmentManagement />;
      case '3':
        return <PoolManagement />;
      case '4':
        return <SystemSettings />;
      default:
        return <UserManagement />;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={250}
        theme="light"
        className="shadow-md"
      >
        <div className="p-4">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => setSelectedKey(key)}
          className="border-r-0"
        />
      </Sider>
      <Layout>
        <Content
          style={{
            margin: '24px',
            padding: 24,
            background: '#fff',
            borderRadius: 8,
          }}
        >
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard; 