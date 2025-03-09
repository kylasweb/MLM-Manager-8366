import { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Select, 
  Button, 
  Switch, 
  InputNumber,
  Modal,
  message,
  Checkbox
} from 'antd';
import { ExperimentOutlined, UserOutlined, WalletOutlined, CrownOutlined, SafetyOutlined } from '@ant-design/icons';
import { mockApi } from '../../services/mockApi';
import { useErrorHandler } from '../../hooks/useErrorHandler';

const UATEngine = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { handleError } = useErrorHandler();
  const [stealthMode, setStealthMode] = useState(true);
  const [batchMode, setBatchMode] = useState(false);

  const ranks = [
    'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'
  ];

  const permissions = [
    'Admin Access',
    'Financial Overrides',
    'Audit Bypass',
    'System Configuration',
    'Content Moderation'
  ];

  // ... keep existing useEffect and fetchUsers ...

  const handleSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        stealth: stealthMode,
        timestamp: new Date().toISOString(),
        batchMode
      };

      if (batchMode && values.userIds) {
        payload.userIds = values.userIds;
      }

      await mockApi.submitUATAction(payload);
      
      if (!stealthMode) {
        message.success('UAT operations completed', 1.5);
        Modal.success({
          title: 'UAT Successful',
          content: 'Test scenarios executed without system impact',
        });
      }
    } catch (error) {
      handleError(error, 'UAT operation failed');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-semibold flex items-center">
          <ExperimentOutlined className="mr-2" />
          User Acceptance Testing Console
        </h2>
        <div className="flex gap-4">
          <Switch
            checkedChildren="Stealth"
            unCheckedChildren="Visible"
            checked={stealthMode}
            onChange={setStealthMode}
          />
          <Switch
            checkedChildren="Batch"
            unCheckedChildren="Single"
            checked={batchMode}
            onChange={setBatchMode}
          />
        </div>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name={batchMode ? "userIds" : "userId"}
          label={batchMode ? "Select Users" : "Select User"}
          rules={[{ required: true }]}
        >
          <Select
            mode={batchMode ? "multiple" : null}
            showSearch
            placeholder="Search users..."
            optionFilterProp="children"
            suffixIcon={<UserOutlined />}
          >
            {users.map(user => (
              <Select.Option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Form.Item name="actionType" label="Test Scenario">
            <Select>
              <Select.Option value="balance">Balance Simulation</Select.Option>
              <Select.Option value="achievement">Achievement Testing</Select.Option>
              <Select.Option value="rank">Rank Validation</Select.Option>
              <Select.Option value="permissions">Access Control Test</Select.Option>
              <Select.Option value="stress">System Stress Test</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="operation" label="Operation Type">
            <Select>
              <Select.Option value="add">Add Test Data</Select.Option>
              <Select.Option value="subtract">Remove Test Data</Select.Option>
              <Select.Option value="set">Set Test Value</Select.Option>
              <Select.Option value="validate">Validate System</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="scope" label="Test Scope">
            <Select>
              <Select.Option value="user">User-Level</Select.Option>
              <Select.Option value="system">System-Wide</Select.Option>
              <Select.Option value="financial">Financial Subsystem</Select.Option>
              <Select.Option value="network">Network Structure</Select.Option>
            </Select>
          </Form.Item>
        </div>

        {/* Dynamic Fields */}
        <Form.Item noStyle shouldUpdate>
          {({ getFieldValue }) => (
            <>
              {getFieldValue('actionType') === 'balance' && (
                <Form.Item name="amount" label="Test Amount" rules={[{ required: true }]}>
                  <InputNumber
                    min={0}
                    addonBefore={<WalletOutlined />}
                    style={{ width: '100%' }}
                    formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  />
                </Form.Item>
              )}

              {getFieldValue('actionType') === 'rank' && (
                <Form.Item name="rank" label="Test Rank" rules={[{ required: true }]}>
                  <Select suffixIcon={<CrownOutlined />}>
                    {ranks.map(rank => (
                      <Select.Option key={rank} value={rank.toLowerCase()}>
                        {rank}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              )}

              {getFieldValue('actionType') === 'permissions' && (
                <Form.Item name="permissions" label="Test Permissions">
                  <Checkbox.Group options={permissions.map(p => ({
                    label: p,
                    value: p.toLowerCase().replace(' ', '_')
                  }))} />
                </Form.Item>
              )}
            </>
          )}
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit"
            className="bg-purple-600 hover:bg-purple-700"
          >
            Execute Test Scenario
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default UATEngine; 