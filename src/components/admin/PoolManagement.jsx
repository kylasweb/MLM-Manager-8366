import { useState, useEffect } from 'react';
import { 
  Table, Button, Input, Modal, Form, 
  message, Popconfirm, Space, InputNumber, Select, Tag,
  Progress, Card, Statistic, Tabs, List, Avatar,
  Timeline, Tooltip, Drawer
} from 'antd';
import {
  TeamOutlined,
  ApartmentOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined
} from '@ant-design/icons';
import { mockApi } from '../../services/mockApi';
import { useErrorHandler } from '../../hooks/useErrorHandler';

const { TabPane } = Tabs;

const PoolManagement = () => {
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedPool, setSelectedPool] = useState(null);
  const [editingPool, setEditingPool] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [poolHistory, setPoolHistory] = useState([]);
  const [poolMetrics, setPoolMetrics] = useState(null);
  const [form] = Form.useForm();
  const { handleError } = useErrorHandler();

  const fetchPools = async () => {
    try {
      setLoading(true);
      const response = await mockApi.getActivePools();
      setPools(response);
    } catch (error) {
      handleError(error, 'Failed to fetch pools');
    } finally {
      setLoading(false);
    }
  };

  const fetchPoolHistory = async () => {
    try {
      setLoading(true);
      const response = await mockApi.getPoolHistory();
      setPoolHistory(response);
    } catch (error) {
      handleError(error, 'Failed to fetch pool history');
    } finally {
      setLoading(false);
    }
  };

  const fetchPoolMetrics = async () => {
    try {
      const response = await mockApi.getPoolMetrics();
      setPoolMetrics(response);
    } catch (error) {
      handleError(error, 'Failed to fetch pool metrics');
    }
  };

  useEffect(() => {
    fetchPools();
    fetchPoolMetrics();
    if (activeTab === 'history') {
      fetchPoolHistory();
    }
  }, [activeTab]);

  const handleCreate = () => {
    setEditingPool(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingPool(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (poolId) => {
    try {
      await mockApi.deletePool(poolId);
      message.success('Pool deleted successfully');
      fetchPools();
    } catch (error) {
      handleError(error, 'Failed to delete pool');
    }
  };

  const handleViewDetails = (pool) => {
    setSelectedPool(pool);
    setDrawerVisible(true);
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingPool) {
        await mockApi.updatePool(editingPool.id, values);
        message.success('Pool updated successfully');
      } else {
        await mockApi.createPool(values);
        message.success('Pool created successfully');
      }
      setModalVisible(false);
      fetchPools();
    } catch (error) {
      handleError(error, 'Failed to save pool');
    }
  };

  const renderMetrics = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <Statistic
          title="Total Pools"
          value={poolMetrics?.totalPools || 0}
          prefix={<ApartmentOutlined />}
        />
      </Card>
      <Card>
        <Statistic
          title="Active Participants"
          value={poolMetrics?.activeParticipants || 0}
          prefix={<TeamOutlined />}
        />
      </Card>
      <Card>
        <Statistic
          title="Completed Pools"
          value={poolMetrics?.completedPools || 0}
          prefix={<CheckCircleOutlined />}
        />
      </Card>
      <Card>
        <Statistic
          title="Average Fill Time"
          value={poolMetrics?.averageFillTime || 0}
          prefix={<ClockCircleOutlined />}
          suffix="Days"
        />
      </Card>
    </div>
  );

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      render: (type) => (
        <Tag color={type === 'binary' ? 'blue' : 'green'}>
          {type.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Progress',
      dataIndex: 'participants',
      render: (participants, record) => (
        <Tooltip title={`${participants}/${record.capacity} participants`}>
          <Progress
            percent={Math.round((participants / record.capacity) * 100)}
            size="small"
            status={participants >= record.capacity ? 'success' : 'active'}
          />
        </Tooltip>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status) => (
        <Tag color={
          status === 'active' ? 'green' :
          status === 'pending' ? 'orange' :
          'red'
        }>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Spillover',
      dataIndex: 'spillover',
      render: (spillover) => spillover ? 'Yes' : 'No',
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
          <Button type="link" onClick={() => handleViewDetails(record)}>
            View Details
          </Button>
          <Button type="primary" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this pool?"
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

  const historyColumns = [
    {
      title: 'Pool Name',
      dataIndex: 'name',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      render: (type) => (
        <Tag color={type === 'binary' ? 'blue' : 'green'}>
          {type.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Participants',
      dataIndex: 'participants',
      render: (participants, record) => `${participants}/${record.capacity}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status) => (
        <Tag color={
          status === 'completed' ? 'green' :
          status === 'cancelled' ? 'red' :
          'orange'
        }>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Completion Date',
      dataIndex: 'completedAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  return (
    <div className="p-6">
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Active Pools" key="active">
          {renderMetrics()}

          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Pool Management</h2>
            <Button type="primary" onClick={handleCreate}>
              Add Pool
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={pools}
            rowKey="id"
            loading={loading}
          />
        </TabPane>

        <TabPane tab="Pool History" key="history">
          <Table
            columns={historyColumns}
            dataSource={poolHistory}
            rowKey="id"
            loading={loading}
          />
        </TabPane>
      </Tabs>

      <Modal
        title={editingPool ? 'Edit Pool' : 'Create Pool'}
        open={modalVisible}
        onOk={handleModalSubmit}
        onCancel={() => setModalVisible(false)}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Pool Name"
            rules={[{ required: true, message: 'Please enter pool name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="type"
            label="Pool Type"
            rules={[{ required: true, message: 'Please select pool type' }]}
          >
            <Select>
              <Select.Option value="binary">Binary</Select.Option>
              <Select.Option value="matrix">Matrix</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="capacity"
            label="Capacity"
            rules={[{ required: true, message: 'Please enter capacity' }]}
          >
            <InputNumber
              min={2}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select>
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="pending">Pending</Select.Option>
              <Select.Option value="closed">Closed</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="spillover"
            label="Enable Spillover"
            valuePropName="checked"
          >
            <Select>
              <Select.Option value={true}>Yes</Select.Option>
              <Select.Option value={false}>No</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="spilloverRules"
            label="Spillover Rules"
            rules={[{ 
              required: form.getFieldValue('spillover'), 
              message: 'Please enter spillover rules' 
            }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="autoComplete"
            label="Auto-Complete Pool"
            valuePropName="checked"
          >
            <Select>
              <Select.Option value={true}>Yes</Select.Option>
              <Select.Option value={false}>No</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title="Pool Details"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={600}
      >
        {selectedPool && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Pool Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <Statistic title="Type" value={selectedPool.type.toUpperCase()} />
                <Statistic title="Status" value={selectedPool.status.toUpperCase()} />
                <Statistic title="Capacity" value={selectedPool.capacity} />
                <Statistic title="Participants" value={selectedPool.participants} />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Participants</h3>
              <List
                dataSource={selectedPool.participantList || []}
                renderItem={participant => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={participant.name}
                      description={participant.email}
                    />
                    <div>Joined: {new Date(participant.joinedAt).toLocaleDateString()}</div>
                  </List.Item>
                )}
              />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Activity Timeline</h3>
              <Timeline>
                {(selectedPool.timeline || []).map((event, index) => (
                  <Timeline.Item key={index}>
                    <p>{event.action}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </Timeline.Item>
                ))}
              </Timeline>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default PoolManagement; 