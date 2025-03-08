import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import { useTheme } from '../contexts/ThemeContext';
import { useGetNetworkQuery } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

function Network() {
  const { darkMode } = useTheme();
  const [selectedNode, setSelectedNode] = useState(null);
  const [viewMode, setViewMode] = useState('tree'); // 'tree' or 'matrix'
  const { data: networkData, isLoading } = useGetNetworkQuery();

  const formatTreeData = (node) => ({
    name: node.username,
    value: `${node.businessVolume} BV`,
    itemStyle: {
      color: node.status === 'active' ? '#10B981' : '#6B7280',
      borderColor: node.isPremium ? '#F59E0B' : '#0ea5e9'
    },
    children: [
      node.left ? formatTreeData(node.left) : { name: 'Empty', value: '0 BV', itemStyle: { color: '#9CA3AF' } },
      node.right ? formatTreeData(node.right) : { name: 'Empty', value: '0 BV', itemStyle: { color: '#9CA3AF' } }
    ]
  });

  const treeOption = {
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const data = params.data;
        return `
          <div class="p-2">
            <div class="font-bold">${data.name}</div>
            <div>Business Volume: ${data.value}</div>
            ${data.rank ? `<div>Rank: ${data.rank}</div>` : ''}
          </div>
        `;
      }
    },
    series: [
      {
        type: 'tree',
        data: [networkData ? formatTreeData(networkData) : []],
        top: '5%',
        left: '20%',
        bottom: '5%',
        right: '20%',
        symbolSize: 12,
        orient: 'vertical',
        label: {
          position: 'top',
          rotate: 0,
          verticalAlign: 'middle',
          align: 'center',
          fontSize: 14,
          color: darkMode ? '#fff' : '#333',
          formatter: (params) => {
            return [
              `{name|${params.data.name}}`,
              `{value|${params.data.value}}`
            ].join('\n');
          },
          rich: {
            name: {
              fontSize: 14,
              fontWeight: 'bold',
              color: darkMode ? '#fff' : '#333'
            },
            value: {
              fontSize: 12,
              color: darkMode ? '#9CA3AF' : '#6B7280'
            }
          }
        },
        leaves: {
          label: {
            position: 'bottom',
            verticalAlign: 'middle',
            align: 'center'
          }
        },
        lineStyle: {
          color: darkMode ? '#4a5568' : '#cbd5e0',
          width: 2,
          curveness: 0.5
        },
        emphasis: {
          focus: 'descendant',
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        },
        expandAndCollapse: true,
        animationDuration: 550,
        animationDurationUpdate: 750,
        initialTreeDepth: 3
      }
    ]
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

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
              {networkData?.totalBV || 0}
            </span>
          </div>
          <div className={`px-4 py-2 rounded-lg ${
            darkMode ? 'bg-dark-card' : 'bg-white'
          } shadow-neo-light dark:shadow-neo-dark`}>
            <span className="text-sm text-gray-500">Direct Referrals:</span>
            <span className={`ml-2 font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {networkData?.directReferrals || 0}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4 mb-4">
        <button
          onClick={() => setViewMode('tree')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            viewMode === 'tree'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Tree View
        </button>
        <button
          onClick={() => setViewMode('matrix')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            viewMode === 'matrix'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Matrix View
        </button>
      </div>

      <div className={`rounded-xl p-6 ${
        darkMode ? 'bg-dark-card' : 'bg-white'
      } shadow-neo-light dark:shadow-neo-dark`}>
        <div className="h-[600px]">
          {viewMode === 'tree' ? (
            <ReactECharts
              option={treeOption}
              style={{ height: '100%', width: '100%' }}
              theme={darkMode ? 'dark' : undefined}
              onEvents={{
                click: (params) => {
                  if (params.data.name !== 'Empty') {
                    setSelectedNode(params.data);
                  }
                }
              }}
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 h-full overflow-auto p-4">
              {[...Array(15)].map((_, level) => (
                <div key={level} className="flex justify-center space-x-4">
                  {[...Array(Math.pow(2, level))].map((_, position) => (
                    <div
                      key={`${level}-${position}`}
                      className={`w-24 h-24 rounded-lg flex flex-col items-center justify-center ${
                        darkMode ? 'bg-gray-800' : 'bg-gray-100'
                      } ${networkData?.matrix?.[level]?.[position] ? 'border-2 border-primary-500' : ''}`}
                    >
                      {networkData?.matrix?.[level]?.[position] ? (
                        <>
                          <span className="font-semibold text-sm">
                            {networkData.matrix[level][position].username}
                          </span>
                          <span className="text-xs text-gray-500">
                            {networkData.matrix[level][position].businessVolume} BV
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-400">Empty</span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedNode && (
        <div className={`rounded-xl p-6 ${
          darkMode ? 'bg-dark-card' : 'bg-white'
        } shadow-neo-light dark:shadow-neo-dark`}>
          <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Selected Member Details
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-500">Username:</span>
              <span className="ml-2 font-semibold">{selectedNode.name}</span>
            </div>
            <div>
              <span className="text-gray-500">Business Volume:</span>
              <span className="ml-2 font-semibold">{selectedNode.value}</span>
            </div>
            <div>
              <span className="text-gray-500">Status:</span>
              <span className={`ml-2 font-semibold ${
                selectedNode.itemStyle.color === '#10B981' ? 'text-green-500' : 'text-gray-500'
              }`}>
                {selectedNode.itemStyle.color === '#10B981' ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Membership:</span>
              <span className={`ml-2 font-semibold ${
                selectedNode.itemStyle.borderColor === '#F59E0B' ? 'text-yellow-500' : 'text-blue-500'
              }`}>
                {selectedNode.itemStyle.borderColor === '#F59E0B' ? 'Premium' : 'Standard'}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`rounded-xl p-6 ${
          darkMode ? 'bg-dark-card' : 'bg-white'
        } shadow-neo-light dark:shadow-neo-dark`}>
          <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Level Statistics
          </h2>
          <div className="space-y-4">
            {networkData?.levelStats?.map((stat, level) => (
              <div key={level} className="flex justify-between items-center">
                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                  Level {level + 1}
                </span>
                <div className="flex items-center space-x-4">
                  <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stat.members} members
                  </span>
                  <span className="text-sm text-gray-500">
                    ({stat.activeMembersPercentage}% active)
                  </span>
                </div>
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
            {networkData?.earnings?.map((earning, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                  {earning.type}
                </span>
                <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  ${earning.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Network;