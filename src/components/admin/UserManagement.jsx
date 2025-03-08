import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Input, Select, Modal, Form, 
  message, Popconfirm, Space, Tag, Tabs,
  Tree, Card, Statistic, Badge, Tooltip,
  Upload
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  DollarOutlined,
  SafetyCertificateOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { mockApi } from '../../services/mockApi';
import { useErrorHandler } from '../../hooks/useErrorHandler';

const { TabPane } = Tabs;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [activeTab, setActiveTab] = useState('list');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [hierarchyData, setHierarchyData] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    role: '',
    search: '',
    kycStatus: ''
  });
  const [form] = Form.useForm();
  const { handleError } = useErrorHandler();

  const fetchUsers = async (params = {}) => {
    try {
      setLoading(true);
      const response = await mockApi.getUsers({
        page: params.current || pagination.current,
        limit: params.pageSize || pagination.pageSize,
        ...filters
      });
      setUsers(response.users);
      setPagination({
        ...pagination,
        total: response.total,
        current: response.page,
        pageSize: response.limit
      });
    } catch (error) {
      handleError(error, 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchHierarchy = async () => {
    try {
      setLoading(true);
      const response = await mockApi.getUserHierarchy();
      setHierarchyData(response);
    } catch (error) {
      handleError(error, 'Failed to fetch user hierarchy');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    if (activeTab === 'hierarchy') {
      fetchHierarchy();
    }
  }, [filters, activeTab]);

  const handleTableChange = (newPagination, filters, sorter) => {
    fetchUsers({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
      sortField: sorter.field,
      sortOrder: sorter.order,
      ...filters,
    });
  };

  const handleCreate = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingUser(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (userId) => {
    try {
      await mockApi.deleteUser(userId);
      message.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      handleError(error, 'Failed to delete user');
    }
  };

  const handleBulkAction = async (action) => {
    try {
      await mockApi.bulkUserAction(selectedUsers, action);
      message.success(`Bulk ${action} completed successfully`);
      fetchUsers();
      setSelectedUsers([]);
    } catch (error) {
      handleError(error, `Failed to perform bulk ${action}`);
    }
  };

  const handleKycUpload = async (userId, file) => {
    try {
      await mockApi.uploadKycDocument(userId, file);
      message.success('KYC document uploaded successfully');
      fetchUsers();
    } catch (error) {
      handleError(error, 'Failed to upload KYC document');
    }
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        await mockApi.updateUser(editingUser.id, values);
        message.success('User updated successfully');
      } else {
        await mockApi.createUser(values);
        message.success('User created successfully');
      }
      setModalVisible(false);
      fetchUsers();
    } catch (error) {
      handleError(error, 'Failed to save user');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      render: (role) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>
          {role.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'orange'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'KYC Status',
      dataIndex: 'kycStatus',
      render: (kycStatus) => (
        <Tag color={
          kycStatus === 'verified' ? 'green' :
          kycStatus === 'pending' ? 'orange' :
          'red'
        }>
          {kycStatus ? kycStatus.toUpperCase() : 'NOT SUBMITTED'}
        </Tag>
      ),
    },
    {
      title: 'Referrals',
      dataIndex: 'referralCount',
      render: (count) => (
        <Badge count={count} showZero style={{ backgroundColor: count ? '#52c41a' : '#d9d9d9' }} />
      ),
    },
    {
      title: 'Total Commission',
      dataIndex: 'totalCommission',
      render: (amount) => `$${amount?.toLocaleString() || '0'}`,
      sorter: (a, b) => (a.totalCommission || 0) - (b.totalCommission || 0),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Upload
            accept=".pdf,.jpg,.png"
            showUploadList={false}
            customRequest={({ file }) => handleKycUpload(record.id, file)}
          >
            <Tooltip title="Upload KYC Document">
              <Button icon={<UploadOutlined />} />
            </Tooltip>
          </Upload>
          <Popconfirm
            title="Are you sure you want to delete this user?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const renderUserStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <Statistic
          title="Total Users"
          value={pagination.total}
          prefix={<UserOutlined />}
        />
      </Card>
      <Card>
        <Statistic
          title="Active Users"
          value={users.filter(u => u.status === 'active').length}
          prefix={<TeamOutlined />}
        />
      </Card>
      <Card>
        <Statistic
          title="Total Commission Paid"
          value={users.reduce((sum, user) => sum + (user.totalCommission || 0), 0)}
          prefix={<DollarOutlined />}
          precision={2}
        />
      </Card>
      <Card>
        <Statistic
          title="KYC Verified Users"
          value={users.filter(u => u.kycStatus === 'verified').length}
          prefix={<SafetyCertificateOutlined />}
        />
      </Card>
    </div>
  );

  return (
    <div className="p-6">
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="User List" key="list">
          {renderUserStats()}
          
          <div className="mb-4 flex justify-between items-center">
            <div className="flex gap-4">
              <Input.Search
                placeholder="Search users..."
                onSearch={(value) => setFilters({ ...filters, search: value })}
                style={{ width: 200 }}
              />
              <Select
                placeholder="Filter by status"
                style={{ width: 150 }}
                onChange={(value) => setFilters({ ...filters, status: value })}
                allowClear
              >
                <Select.Option value="active">Active</Select.Option>
                <Select.Option value="inactive">Inactive</Select.Option>
              </Select>
              <Select
                placeholder="Filter by role"
                style={{ width: 150 }}
                onChange={(value) => setFilters({ ...filters, role: value })}
                allowClear
              >
                <Select.Option value="admin">Admin</Select.Option>
                <Select.Option value="user">User</Select.Option>
              </Select>
              <Select
                placeholder="Filter by KYC Status"
                style={{ width: 150 }}
                onChange={(value) => setFilters({ ...filters, kycStatus: value })}
                allowClear
              >
                <Select.Option value="verified">Verified</Select.Option>
                <Select.Option value="pending">Pending</Select.Option>
                <Select.Option value="rejected">Rejected</Select.Option>
                <Select.Option value="not_submitted">Not Submitted</Select.Option>
              </Select>
            </div>
            <Space>
              {selectedUsers.length > 0 && (
                <>
                  <Button onClick={() => handleBulkAction('activate')}>
                    Activate Selected
                  </Button>
                  <Button onClick={() => handleBulkAction('deactivate')}>
                    Deactivate Selected
                  </Button>
                  <Button danger onClick={() => handleBulkAction('delete')}>
                    Delete Selected
                  </Button>
                </>
              )}
              <Button type="primary" onClick={handleCreate}>
                Add User
              </Button>
            </Space>
          </div>

          <Table
            columns={columns}
            dataSource={users}
            rowKey="id"
            pagination={pagination}
            loading={loading}
            onChange={handleTableChange}
            rowSelection={{
              selectedRowKeys: selectedUsers,
              onChange: setSelectedUsers,
            }}
          />
        </TabPane>

        <TabPane tab="Network Hierarchy" key="hierarchy">
          <div className="bg-white p-6 rounded-lg shadow">
            {loading ? (
              <div className="flex justify-center py-8">Loading hierarchy...</div>
            ) : (
              <Tree
                treeData={hierarchyData}
                defaultExpandAll
                showLine={{ showLeafIcon: false }}
                showIcon
              />
            )}
          </div>
        </TabPane>

        <TabPane tab="Commission History" key="commission">
          {/* Commission history table will be implemented here */}
        </TabPane>
      </Tabs>

      <Modal
        title={editingUser ? 'Edit User' : 'Create User'}
        open={modalVisible}
        onOk={handleModalSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select role' }]}
          >
            <Select>
              <Select.Option value="admin">Admin</Select.Option>
              <Select.Option value="user">User</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select>
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="inactive">Inactive</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="kycStatus"
            label="KYC Status"
            rules={[{ required: true, message: 'Please select KYC status' }]}
          >
            <Select>
              <Select.Option value="verified">Verified</Select.Option>
              <Select.Option value="pending">Pending</Select.Option>
              <Select.Option value="rejected">Rejected</Select.Option>
              <Select.Option value="not_submitted">Not Submitted</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="referralCode"
            label="Referral Code"
          >
            <Input disabled={!!editingUser} />
          </Form.Item>
          {editingUser && (
            <Form.Item
              name="parentId"
              label="Upline User"
            >
              <Select
                showSearch
                placeholder="Select upline user"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {users
                  .filter(u => u.id !== editingUser.id)
                  .map(u => (
                    <Select.Option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </Select.Option>
                  ))
                }
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement; 