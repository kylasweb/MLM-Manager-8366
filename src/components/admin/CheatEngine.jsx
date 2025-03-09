import { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Select, 
  Button, 
  Switch, 
  InputNumber,
  Modal,
  message
} from 'antd';
import { CodeOutlined, UserOutlined, WalletOutlined } from '@ant-design/icons';
import { mockApi } from '../../services/mockApi';
import { useErrorHandler } from '../../hooks/useErrorHandler';

const CheatEngine = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { handleError } = useErrorHandler();
  const [stealthMode, setStealthMode] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await mockApi.getUsers();
      setUsers(response);
    } catch (error) {
      handleError(error, 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        stealth: stealthMode,
        timestamp: new Date().toISOString()
      };

      await mockApi.submitCheatAction(payload);
      message.success('System modified successfully', 1.5);
      
      if (!stealthMode) {
        Modal.success({
          title: 'Operation Successful',
          content: 'Changes applied with visible effects',
        });
      }
    } catch (error) {
      handleError(error, 'Cheat operation failed');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-semibold flex items-center">
          <CodeOutlined className="mr-2" />
          System Management Console
        </h2>
        <Switch
          checkedChildren="Stealth"
          unCheckedChildren="Visible"
          checked={stealthMode}
          onChange={setStealthMode}
        />
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ 
          actionType: 'balance',
          operation: 'add' 
        }}
      >
        <Form.Item
          name="userId"
          label="Select User"
          rules={[{ required: true }]}
        >
          <Select
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Form.Item
            name="actionType"
            label="Modification Type"
          >
            <Select>
              <Select.Option value="balance">Balance Adjustment</Select.Option>
              <Select.Option value="achievement">Achievement Unlock</Select.Option>
              <Select.Option value="rank">Rank Modification</Select.Option>
              <Select.Option value="permissions">Special Permissions</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="operation"
            label="Operation Type"
          >
            <Select>
              <Select.Option value="add">Add</Select.Option>
              <Select.Option value="subtract">Subtract</Select.Option>
              <Select.Option value="set">Set Directly</Select.Option>
            </Select>
          </Form.Item>
        </div>

        <Form.Item
          noStyle
          shouldUpdate={(prev, current) => prev.actionType !== current.actionType}
        >
          {({ getFieldValue }) => (
            getFieldValue('actionType') === 'balance' ? (
              <Form.Item
                name="amount"
                label="Amount"
                rules={[{ required: true }]}
              >
                <InputNumber
                  min={0}
                  addonBefore={<WalletOutlined />}
                  style={{ width: '100%' }}
                  formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            ) : getFieldValue('actionType') === 'achievement' ? (
              <Form.Item
                name="achievementId"
                label="Achievement"
                rules={[{ required: true }]}
              >
                <Select>
                  <Select.Option value="vip">VIP Status</Select.Option>
                  <Select.Option value="top_earner">Top Earner Badge</Select.Option>
                  <Select.Option value="founder">Founder Title</Select.Option>
                </Select>
              </Form.Item>
            ) : null
          )}
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit"
            className="bg-blue-600 hover:bg-blue-700"
          >
            Execute Command
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CheatEngine; 