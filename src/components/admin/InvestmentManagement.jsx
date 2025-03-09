import { useState, useEffect } from 'react';
import { 
  Table, Button, Input, Modal, Form, 
  message, Popconfirm, Space, InputNumber,
  Card, Statistic, DatePicker, Tabs,
  Timeline, Tag, Select, Switch
} from 'antd';
import {
  DollarOutlined,
  UsergroupAddOutlined,
  RiseOutlined,
  FieldTimeOutlined
} from '@ant-design/icons';
import { mockApi } from '../../services/mockApi';
import { useErrorHandler } from '../../hooks/useErrorHandler';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const InvestmentManagement = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [activeTab, setActiveTab] = useState('plans');
  const [investmentHistory, setInvestmentHistory] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [form] = Form.useForm();
  const { handleError } = useErrorHandler();

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await mockApi.getInvestmentPlans();
      setPlans(response);
    } catch (error) {
      handleError(error, 'Failed to fetch investment plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvestmentHistory = async () => {
    try {
      setLoading(true);
      const response = await mockApi.getInvestmentHistory();
      setInvestmentHistory(response);
    } catch (error) {
      handleError(error, 'Failed to fetch investment history');
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformanceMetrics = async () => {
    try {
      const response = await mockApi.getInvestmentMetrics();
      setPerformanceMetrics(response);
    } catch (error) {
      handleError(error, 'Failed to fetch performance metrics');
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchPerformanceMetrics();
    if (activeTab === 'history') {
      fetchInvestmentHistory();
    }
  }, [activeTab]);

  const handleCreate = () => {
    setEditingPlan(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingPlan(record);
    form.setFieldsValue({
      ...record,
      activePeriod: record.activePeriod ? [
        record.activePeriod.start,
        record.activePeriod.end
      ] : null,
      commissionStructure: record.commissionStructure || [
        { level: 1, percentage: 10 },
        { level: 2, percentage: 5 },
        { level: 3, percentage: 3 }
      ]
    });
    setModalVisible(true);
  };

  const handleDelete = async (planId) => {
    try {
      await mockApi.deleteInvestmentPlan(planId);
      message.success('Investment plan deleted successfully');
      fetchPlans();
    } catch (error) {
      handleError(error, 'Failed to delete investment plan');
    }
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formattedValues = {
        ...values,
        activePeriod: values.activePeriod ? {
          start: values.activePeriod[0],
          end: values.activePeriod[1]
        } : null
      };

      if (editingPlan) {
        await mockApi.updateInvestmentPlan(editingPlan.id, formattedValues);
        message.success('Investment plan updated successfully');
      } else {
        await mockApi.createInvestmentPlan(formattedValues);
        message.success('Investment plan created successfully');
      }
      setModalVisible(false);
      fetchPlans();
    } catch (error) {
      handleError(error, 'Failed to save investment plan');
    }
  };

  const renderMetrics = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <Statistic
          title="Total Investment Value"
          value={performanceMetrics?.totalInvestment || 0}
          prefix={<DollarOutlined />}
          precision={2}
        />
      </Card>
      <Card>
        <Statistic
          title="Active Investors"
          value={performanceMetrics?.activeInvestors || 0}
          prefix={<UsergroupAddOutlined />}
        />
      </Card>
      <Card>
        <Statistic
          title="Average ROI"
          value={performanceMetrics?.averageRoi || 0}
          prefix={<RiseOutlined />}
          suffix="%"
          precision={2}
        />
      </Card>
      <Card>
        <Statistic
          title="Average Duration"
          value={performanceMetrics?.averageDuration || 0}
          prefix={<FieldTimeOutlined />}
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
      title: 'Description',
      dataIndex: 'description',
    },
    {
      title: 'Minimum Amount',
      dataIndex: 'minAmount',
      render: (amount) => `$${amount.toLocaleString()}`,
      sorter: (a, b) => a.minAmount - b.minAmount,
    },
    {
      title: 'Maximum Amount',
      dataIndex: 'maxAmount',
      render: (amount) => `$${amount.toLocaleString()}`,
      sorter: (a, b) => a.maxAmount - b.maxAmount,
    },
    {
      title: 'ROI (%)',
      dataIndex: 'roi',
      render: (roi) => `${roi}%`,
      sorter: (a, b) => a.roi - b.roi,
    },
    {
      title: 'Duration (Days)',
      dataIndex: 'duration',
      sorter: (a, b) => a.duration - b.duration,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status) => (
        <Tag color={
          status === 'active' ? 'green' :
          status === 'scheduled' ? 'blue' :
          'orange'
        }>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Active Period',
      dataIndex: 'activePeriod',
      render: (period) => period ? (
        <span>
          {new Date(period.start).toLocaleDateString()} - 
          {new Date(period.end).toLocaleDateString()}
        </span>
      ) : 'No schedule',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this investment plan?"
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
      title: 'Investor',
      dataIndex: 'investor',
      render: (investor) => `${investor.name} (${investor.email})`,
    },
    {
      title: 'Plan',
      dataIndex: 'plan',
      render: (plan) => plan.name,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      render: (amount) => `$${amount.toLocaleString()}`,
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status) => (
        <Tag color={
          status === 'active' ? 'green' :
          status === 'completed' ? 'blue' :
          status === 'cancelled' ? 'red' :
          'orange'
        }>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.startDate) - new Date(b.startDate),
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      render: (date) => date ? new Date(date).toLocaleDateString() : '-',
    },
  ];

  return (
    <div className="p-6">
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Investment Plans" key="plans">
          {renderMetrics()}

          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Investment Plans</h2>
            <Button type="primary" onClick={handleCreate}>
              Add Investment Plan
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={plans}
            rowKey="id"
            loading={loading}
          />
        </TabPane>

        <TabPane tab="Investment History" key="history">
          <Table
            columns={historyColumns}
            dataSource={investmentHistory}
            rowKey="id"
            loading={loading}
          />
        </TabPane>
      </Tabs>

      <Modal
        title={editingPlan ? 'Edit Investment Plan' : 'Create Investment Plan'}
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
            label="Plan Name"
            rules={[{ required: true, message: 'Please enter plan name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="minAmount"
              label="Minimum Amount ($)"
              rules={[{ required: true, message: 'Please enter minimum amount' }]}
            >
              <InputNumber
                min={0}
                step={100}
                style={{ width: '100%' }}
                formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>

            <Form.Item
              name="maxAmount"
              label="Maximum Amount ($)"
              rules={[{ required: true, message: 'Please enter maximum amount' }]}
            >
              <InputNumber
                min={0}
                step={100}
                style={{ width: '100%' }}
                formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="roi"
              label="ROI (%)"
              rules={[{ required: true, message: 'Please enter ROI percentage' }]}
            >
              <InputNumber
                min={0}
                max={100}
                step={0.1}
                style={{ width: '100%' }}
                formatter={value => `${value}%`}
                parser={value => value.replace('%', '')}
              />
            </Form.Item>

            <Form.Item
              name="duration"
              label="Duration (Days)"
              rules={[{ required: true, message: 'Please enter duration' }]}
            >
              <InputNumber
                min={1}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </div>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select>
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="scheduled">Scheduled</Select.Option>
              <Select.Option value="inactive">Inactive</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="activePeriod"
            label="Active Period"
          >
            <RangePicker
              showTime
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="autoRenew"
            label="Auto Renew"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.List name="commissionStructure">
            {(fields, { add, remove }) => (
              <div className="border p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Commission Structure</h3>
                  <Button type="dashed" onClick={() => add()}>
                    Add Level
                  </Button>
                </div>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} className="grid grid-cols-2 gap-4 mb-4">
                    <Form.Item
                      {...restField}
                      name={[name, 'level']}
                      label="Level"
                      rules={[{ required: true, message: 'Missing level' }]}
                    >
                      <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'percentage']}
                      label="Commission %"
                      rules={[{ required: true, message: 'Missing percentage' }]}
                    >
                      <InputNumber
                        min={0}
                        max={100}
                        step={0.1}
                        style={{ width: '100%' }}
                        formatter={value => `${value}%`}
                        parser={value => value.replace('%', '')}
                      />
                    </Form.Item>
                    <Button type="text" danger onClick={() => remove(name)}>
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
};

export default InvestmentManagement; 