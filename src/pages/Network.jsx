import { useState } from 'react';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import { useTheme } from '../contexts/ThemeContext';

function Network() {
  const { darkMode } = useTheme();
  const [selectedNode, setSelectedNode] = useState(null);

  const treeData = {
    name: 'You',
    value: '500 BV',
    children: [
      {
        name: 'John Doe',
        value: '300 BV',
        children: [
          {
            name: 'Alice Smith',
            value: '150 BV',
            children: []
          },
          {
            name: 'Bob Wilson',
            value: '100 BV',
            children: []
          }
        ]
      },
      {
        name: 'Jane Smith',
        value: '200 BV',
        children: [
          {
            name: 'Charlie Brown',
            value: '100 BV',
            children: []
          },
          {
            name: 'David Clark',
            value: '50 BV',
            children: []
          }
        ]
      }
    ]
  };

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}'
    },
    series: [
      {
        type: 'tree',
        data: [treeData],
        top: '5%',
        left: '20%',
        bottom: '5%',
        right: '20%',
        symbolSize: 10,
        orient: 'vertical',
        label: {
          position: 'top',
          rotate: 0,
          verticalAlign: 'middle',
          align: 'center',
          fontSize: 14,
          color: darkMode ? '#fff' : '#333'
        },
        leaves: {
          label: {
            position: 'bottom',
            verticalAlign: 'middle',
            align: 'center'
          }
        },
        itemStyle: {
          color: '#0ea5e9',
          borderColor: '#0ea5e9'
        },
        lineStyle: {
          color: darkMode ? '#4a5568' : '#cbd5e0',
          width: 2
        },
        emphasis: {
          focus: 'descendant'
        },
        expandAndCollapse: true,
        animationDuration: 550,
        animationDurationUpdate: 750
      }
    ]
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Your Network
        </h1>
        <div className="flex space-x-4">
          <div className={`px-4 py-2 rounded-lg ${
            darkMode ? 'bg-dark-card' : 'bg-white'
          } shadow-neo-light dark:shadow-neo-dark`}>
            <span className="text-sm text-gray-500">Total BV:</span>
            <span className={`ml-2 font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              1,250
            </span>
          </div>
          <div className={`px-4 py-2 rounded-lg ${
            darkMode ? 'bg-dark-card' : 'bg-white'
          } shadow-neo-light dark:shadow-neo-dark`}>
            <span className="text-sm text-gray-500">Direct Referrals:</span>
            <span className={`ml-2 font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              2
            </span>
          </div>
        </div>
      </div>

      <div className={`rounded-xl p-6 ${
        darkMode ? 'bg-dark-card' : 'bg-white'
      } shadow-neo-light dark:shadow-neo-dark`}>
        <div className="h-[600px]">
          <ReactECharts
            option={option}
            style={{ height: '100%', width: '100%' }}
            theme={darkMode ? 'dark' : undefined}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`rounded-xl p-6 ${
          darkMode ? 'bg-dark-card' : 'bg-white'
        } shadow-neo-light dark:shadow-neo-dark`}>
          <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Level Statistics
          </h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(level => (
              <div key={level} className="flex justify-between items-center">
                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                  Level {level}
                </span>
                <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {Math.pow(2, level - 1)} members
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className={`rounded-xl p-6 ${
          darkMode ? 'bg-dark-card' : 'bg-white'
        } shadow-neo-light dark:shadow-neo-dark`}>
          <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Earnings Breakdown
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                Direct Referral Bonus
              </span>
              <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                $200.00
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                Level Bonus
              </span>
              <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                $150.00
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                Matching Bonus
              </span>
              <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                $100.00
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Network;