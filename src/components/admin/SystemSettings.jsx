import React, { useState, useEffect } from 'react';
import { 
  Card, Form, InputNumber, Button, 
  message, Divider, Space, Alert,
  Tabs, Switch, Input, Select, TimePicker,
  Upload, Modal
} from 'antd';
import {
  UploadOutlined,
  SaveOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { mockApi } from '../../services/mockApi';
import { useErrorHandler } from '../../hooks/useErrorHandler';

const { TabPane } = Tabs;
const { TextArea } = Input;

const SystemSettings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('investment');
  const [maintenanceScheduled, setMaintenanceScheduled] = useState(false);
  const [form] = Form.useForm();
  const { handleError } = useErrorHandler();

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const settings = await mockApi.getSettings();
      form.setFieldsValue({
        ...settings,
        maintenanceTime: settings.maintenanceTime ? 
          [settings.maintenanceTime.start, settings.maintenanceTime.end] : undefined
      });
      setMaintenanceScheduled(settings.maintenanceMode || false);
    } catch (error) {
      handleError(error, 'Failed to fetch system settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (values) => {
    try {
      setSaving(true);
      const formattedValues = {
        ...values,
        maintenanceTime: values.maintenanceTime ? {
          start: values.maintenanceTime[0],
          end: values.maintenanceTime[1]
        } : null
      };
      await mockApi.updateSettings(formattedValues);
      message.success('Settings updated successfully');
    } catch (error) {
      handleError(error, 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleMaintenanceModeChange = async (checked) => {
    try {
      await mockApi.toggleMaintenanceMode(checked);
      setMaintenanceScheduled(checked);
      message.success(`Maintenance mode ${checked ? 'enabled' : 'disabled'}`);
    } catch (error) {
      handleError(error, 'Failed to toggle maintenance mode');
    }
  };

  const handleNotificationTemplateUpload = async (file) => {
    try {
      await mockApi.uploadNotificationTemplate(file);
      message.success('Notification template uploaded successfully');
    } catch (error) {
      handleError(error, 'Failed to upload notification template');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">System Settings</h2>
        <p className="text-gray-600">Configure global system parameters</p>
      </div>

      {maintenanceScheduled && (
        <Alert
          message="Maintenance Mode Scheduled"
          description="The system is scheduled for maintenance. Users will be notified before the maintenance window."
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          className="mb-6"
        />
      )}

      <Card loading={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="Investment Settings" key="investment">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Investment Limits</h3>
                  <Form.Item
                    name="minInvestment"
                    label="Minimum Investment Amount ($)"
                    rules={[{ required: true, message: 'Please enter minimum investment amount' }]}
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
                    name="maxInvestment"
                    label="Maximum Investment Amount ($)"
                    rules={[{ required: true, message: 'Please enter maximum investment amount' }]}
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

                <div>
                  <h3 className="text-lg font-medium mb-4">Commission Settings</h3>
                  <Form.Item
                    name="referralBonus"
                    label="Referral Bonus (%)"
                    rules={[{ required: true, message: 'Please enter referral bonus percentage' }]}
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
                    name="withdrawalFee"
                    label="Withdrawal Fee (%)"
                    rules={[{ required: true, message: 'Please enter withdrawal fee percentage' }]}
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
                </div>
              </div>
            </TabPane>

            <TabPane tab="KYC Requirements" key="kyc">
              <div className="space-y-6">
                <Form.Item
                  name="kycEnabled"
                  label="Enable KYC Verification"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name="requiredDocuments"
                  label="Required Documents"
                >
                  <Select mode="multiple">
                    <Select.Option value="id">Government ID</Select.Option>
                    <Select.Option value="passport">Passport</Select.Option>
                    <Select.Option value="driving_license">Driving License</Select.Option>
                    <Select.Option value="utility_bill">Utility Bill</Select.Option>
                    <Select.Option value="bank_statement">Bank Statement</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="kycInstructions"
                  label="KYC Instructions"
                >
                  <TextArea rows={4} />
                </Form.Item>

                <Form.Item
                  name="kycVerificationTimeout"
                  label="Verification Timeout (hours)"
                >
                  <InputNumber min={1} max={168} style={{ width: '100%' }} />
                </Form.Item>
              </div>
            </TabPane>

            <TabPane tab="Payout Schedule" key="payout">
              <div className="space-y-6">
                <Form.Item
                  name="payoutFrequency"
                  label="Payout Frequency"
                >
                  <Select>
                    <Select.Option value="daily">Daily</Select.Option>
                    <Select.Option value="weekly">Weekly</Select.Option>
                    <Select.Option value="biweekly">Bi-weekly</Select.Option>
                    <Select.Option value="monthly">Monthly</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="minimumPayout"
                  label="Minimum Payout Amount ($)"
                >
                  <InputNumber
                    min={0}
                    style={{ width: '100%' }}
                    formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  />
                </Form.Item>

                <Form.Item
                  name="payoutProcessingDays"
                  label="Processing Days"
                >
                  <Select mode="multiple">
                    <Select.Option value={1}>Monday</Select.Option>
                    <Select.Option value={2}>Tuesday</Select.Option>
                    <Select.Option value={3}>Wednesday</Select.Option>
                    <Select.Option value={4}>Thursday</Select.Option>
                    <Select.Option value={5}>Friday</Select.Option>
                    <Select.Option value={6}>Saturday</Select.Option>
                    <Select.Option value={0}>Sunday</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="payoutCutoffTime"
                  label="Daily Cutoff Time"
                >
                  <TimePicker format="HH:mm" style={{ width: '100%' }} />
                </Form.Item>
              </div>
            </TabPane>

            <TabPane tab="Notifications" key="notifications">
              <div className="space-y-6">
                <Form.Item
                  name="notificationTypes"
                  label="Enable Notifications"
                >
                  <Select mode="multiple">
                    <Select.Option value="email">Email</Select.Option>
                    <Select.Option value="sms">SMS</Select.Option>
                    <Select.Option value="push">Push Notifications</Select.Option>
                    <Select.Option value="in_app">In-App Notifications</Select.Option>
                  </Select>
                </Form.Item>

                <div className="border p-4 rounded-lg">
                  <h4 className="text-lg font-medium mb-4">Notification Templates</h4>
                  <Upload
                    accept=".html,.txt"
                    customRequest={({ file }) => handleNotificationTemplateUpload(file)}
                    showUploadList={false}
                  >
                    <Button icon={<UploadOutlined />}>Upload Template</Button>
                  </Upload>
                </div>

                <Form.Item
                  name="notificationCooldown"
                  label="Notification Cooldown (minutes)"
                >
                  <InputNumber min={0} max={1440} style={{ width: '100%' }} />
                </Form.Item>
              </div>
            </TabPane>

            <TabPane tab="Maintenance" key="maintenance">
              <div className="space-y-6">
                <Form.Item
                  label="Maintenance Mode"
                  className="mb-8"
                >
                  <Switch
                    checked={maintenanceScheduled}
                    onChange={handleMaintenanceModeChange}
                  />
                </Form.Item>

                <Form.Item
                  name="maintenanceTime"
                  label="Maintenance Window"
                >
                  <TimePicker.RangePicker format="HH:mm" style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                  name="maintenanceMessage"
                  label="Maintenance Message"
                >
                  <TextArea rows={4} />
                </Form.Item>
              </div>
            </TabPane>
          </Tabs>

          <Divider />

          <div className="flex justify-end">
            <Space>
              <Button onClick={() => form.resetFields()}>
                Reset
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={saving}
                icon={<SaveOutlined />}
              >
                Save Changes
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default SystemSettings; 