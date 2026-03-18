// 发票开具APP交互脚本

// 已开票选择模式状态
let isCompletedSelectMode = false;

// 当前发送邮箱的发票ID（单个发送时使用）
let currentEmailInvoiceId = null;

// 待开票数据
const pendingInvoiceData = [
  { id: 1, type: 'gongben', typeName: '工本费发票', productNo: 'GB202401150001', amount: 25.00, time: '2024-01-15 10:30:22' },
  { id: 2, type: 'gongben', typeName: '工本费发票', productNo: 'GB202401160002', amount: 30.00, time: '2024-01-16 14:20:10' },
  { id: 3, type: 'weiyue', typeName: '违约金发票', bankAccount: '6222 **** **** 1234', amount: 50.00, time: '2024-01-14 16:45:10' },
  { id: 4, type: 'weiyue', typeName: '违约金发票', bankAccount: '6222 **** **** 5678', amount: 80.00, time: '2024-01-13 11:30:00' },
  // 停车费无数据，测试空状态
  // { id: 5, type: 'tingche', typeName: '停车费发票', plateNo: '粤A12345', entryTime: '2024-01-13 09:20:35', exitTime: '2024-01-13 11:45:20', amount: 38.00 },
  { id: 6, type: 'quanyi', typeName: '权益及服务发票', productNo: 'QY202401120008', amount: 128.00, time: '2024-01-12 14:15:48' },
  // 粤通商城无数据，测试空状态
  // { id: 7, type: 'yuetong', typeName: '粤通商城发票', orderNo: 'YT202401110021', productName: '车载香水套装', amount: 256.50, time: '2024-01-11 11:30:00' },
];

// 业务类型配置
const businessTypes = {
  xiaofeichongzhi: { name: '消费充值发票', tagClass: 'tag-xiaofeichongzhi', order: 1, isExternal: true, externalUrl: 'consume-recharge.html' },
  yidongzhifu: { name: '移动支付发票', tagClass: 'tag-yidongzhifu', order: 2, isExternal: true, externalUrl: 'mobile-payment.html' },
  gongben: { name: '工本费发票', tagClass: 'tag-gongben', order: 3 },
  weiyue: { name: '违约金发票', tagClass: 'tag-weiyue', order: 4 },
  tingche: { name: '停车费发票', tagClass: 'tag-tingche', order: 5, guideUrl: 'parking-guide.html' },
  quanyi: { name: '权益及服务发票', tagClass: 'tag-quanyi', order: 6 },
  yuetong: { name: '粤通商城发票', tagClass: 'tag-yuetong', order: 7 }
};

// 分组展开状态
const groupExpandState = {};

// 已开票分组展开状态
const completedGroupExpandState = {};

// 已开票数据
const completedInvoiceData = [
  // 工本费 - 多张发票
  { id: 1, type: 'gongben', invoiceType: 'pupiao', invoiceNo: '24400190011112345678', invoiceDate: '2024-01-10', amount: 25.00 },
  { id: 2, type: 'gongben', invoiceType: 'pupiao', invoiceNo: '24400190011112345679', invoiceDate: '2024-01-09', amount: 30.00 },
  { id: 3, type: 'gongben', invoiceType: 'zhuanpiao', invoiceNo: '24400190011112345680', invoiceDate: '2024-01-08', amount: 45.00 },
  // 违约金 - 多张发票
  { id: 4, type: 'weiyue', invoiceType: 'zhuanpiao', invoiceNo: '24400190011112345681', invoiceDate: '2024-01-07', amount: 500.00 },
  { id: 5, type: 'weiyue', invoiceType: 'pupiao', invoiceNo: '24400190011112345682', invoiceDate: '2024-01-06', amount: 320.00 },
  // 停车费 - 无数据，显示空状态
  // 权益及服务 - 多张发票
  { id: 6, type: 'quanyi', invoiceType: 'zhuanpiao', invoiceNo: '24400190011112345683', invoiceDate: '2024-01-05', amount: 128.00 },
  { id: 7, type: 'quanyi', invoiceType: 'pupiao', invoiceNo: '24400190011112345684', invoiceDate: '2024-01-04', amount: 88.00 },
  { id: 8, type: 'quanyi', invoiceType: 'pupiao', invoiceNo: '24400190011112345685', invoiceDate: '2024-01-03', amount: 66.00 },
  // 粤通商城 - 无数据，显示空状态
];

// 发票类型配置
const invoiceTypes = {
  pupiao: { name: '普票', tagClass: 'tag-pupiao' },
  zhuanpiao: { name: '专票', tagClass: 'tag-zhuanpiao' }
};

document.addEventListener('DOMContentLoaded', function() {
  // 初始化标签页切换
  initTabs();

  // 初始化弹窗
  initModal();

  // 初始化发票类型选择
  initInvoiceTypeSelector();

  // 初始化日期筛选（默认三个月）
  initDateFilter();

  // 渲染待开票列表
  renderPendingInvoices();

  // 渲染已开票列表
  renderCompletedInvoices();
});

// 初始化日期筛选（默认三个月）
function initDateFilter() {
  // 设置默认日期：三个月前到今天
  const today = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const startDateStr = formatDate(threeMonthsAgo);
  const endDateStr = formatDate(today);

  // 待开票页面日期筛选
  const dateStart = document.getElementById('date-start');
  const dateEnd = document.getElementById('date-end');
  if (dateStart && dateEnd) {
    dateStart.value = startDateStr;
    dateEnd.value = endDateStr;
  }

  // 已开票页面日期筛选
  const completedDateStart = document.getElementById('completed-date-start');
  const completedDateEnd = document.getElementById('completed-date-end');
  if (completedDateStart && completedDateEnd) {
    completedDateStart.value = startDateStr;
    completedDateEnd.value = endDateStr;
  }
}

// 格式化日期为 YYYY-MM-DD
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 标签页切换
function initTabs() {
  const tabItems = document.querySelectorAll('.tab-item');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabItems.forEach(item => {
    item.addEventListener('click', function() {
      const targetId = this.getAttribute('data-tab');

      // 切换标签激活状态
      tabItems.forEach(t => t.classList.remove('active'));
      this.classList.add('active');

      // 切换内容面板
      tabPanes.forEach(pane => {
        pane.classList.remove('active');
        if (pane.id === targetId) {
          pane.classList.add('active');
        }
      });

      // 切换标签页时退出已开票选择模式
      if (isCompletedSelectMode) {
        cancelCompletedSelectMode();
      }
    });
  });
}

// 渲染待开票列表（按业务类型分组）
function renderPendingInvoices() {
  const container = document.getElementById('pending-invoice-list');
  if (!container) return;

  // 按业务类型分组
  const groupedData = {};
  pendingInvoiceData.forEach(item => {
    if (!groupedData[item.type]) {
      groupedData[item.type] = [];
    }
    groupedData[item.type].push(item);
  });

  // 获取所有业务类型并按配置顺序排序
  const sortedTypes = Object.keys(businessTypes).sort((a, b) => {
    return (businessTypes[a]?.order || 99) - (businessTypes[b]?.order || 99);
  });

  let html = '';

  sortedTypes.forEach(type => {
    const items = groupedData[type] || [];
    const typeConfig = businessTypes[type] || { name: type, tagClass: '' };

    // 外部链接类型处理
    if (typeConfig.isExternal) {
      html += `
        <div class="invoice-group external-link" data-type="${type}">
          <div class="group-header" onclick="toggleGroup('${type}')">
            <div class="group-left">
              <span class="group-title">${typeConfig.name}</span>
            </div>
            <span class="group-arrow">›</span>
          </div>
        </div>
      `;
      return; // 跳过后续渲染
    }

    // 默认折叠
    const isExpanded = groupExpandState[type] === true;

    // 是否有查看指引链接
    const hasGuide = typeConfig.guideUrl;

    html += `
      <div class="invoice-group" data-type="${type}">
        <div class="group-header" onclick="toggleGroup('${type}')">
          <div class="group-left">
            <span class="group-expand-icon ${isExpanded ? 'expanded' : ''}">▶</span>
            <span class="group-title">${typeConfig.name}</span>
            <span class="group-count">${items.length}条</span>
          </div>
          ${hasGuide ? `<a href="${typeConfig.guideUrl}" class="guide-link-btn" onclick="event.stopPropagation()">查看指引</a>` : ''}
        </div>
        <div class="group-content" style="display: ${isExpanded ? 'block' : 'none'}">
    `;

    // 如果有数据，渲染发票项；否则显示空状态
    if (items.length > 0) {
      items.forEach(item => {
        html += renderInvoiceItem(item, typeConfig);
      });
    } else {
      html += `
        <div class="group-empty">
          <span class="empty-text">${hasGuide ? '暂无待开票数据，' : '暂无待开票数据'}</span>
          ${hasGuide ? `<a href="${typeConfig.guideUrl}" class="guide-link-text">查看开票指引</a>` : ''}
        </div>
      `;
    }

    html += `
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  // 重新绑定复选框事件
  bindCheckboxEvents();
}

// 渲染单个发票项
function renderInvoiceItem(item, typeConfig) {
  let detailRows = '';

  if (item.type === 'gongben') {
    detailRows = `
      <div class="invoice-row"><span class="label">产品号</span><span class="value">${item.productNo}</span></div>
      <div class="invoice-row"><span class="label">交易时间</span><span class="value">${item.time}</span></div>
    `;
  } else if (item.type === 'weiyue') {
    detailRows = `
      <div class="invoice-row"><span class="label">银行账号</span><span class="value">${item.bankAccount}</span></div>
      <div class="invoice-row"><span class="label">交易时间</span><span class="value">${item.time}</span></div>
    `;
  } else if (item.type === 'tingche') {
    detailRows = `
      <div class="invoice-row"><span class="label">车牌号</span><span class="value">${item.plateNo}</span></div>
      <div class="invoice-row"><span class="label">入场时间</span><span class="value">${item.entryTime}</span></div>
      <div class="invoice-row"><span class="label">出场时间</span><span class="value">${item.exitTime}</span></div>
    `;
  } else if (item.type === 'quanyi') {
    detailRows = `
      <div class="invoice-row"><span class="label">产品号</span><span class="value">${item.productNo}</span></div>
      <div class="invoice-row"><span class="label">交易时间</span><span class="value">${item.time}</span></div>
    `;
  } else if (item.type === 'yuetong') {
    detailRows = `
      <div class="invoice-row"><span class="label">订单号</span><span class="value">${item.orderNo}</span></div>
      <div class="invoice-row"><span class="label">商品名</span><span class="value">${item.productName}</span></div>
      <div class="invoice-row"><span class="label">交易时间</span><span class="value">${item.time}</span></div>
    `;
  }

  return `
    <div class="invoice-item" data-id="${item.id}" data-amount="${item.amount}" data-type="${item.type}">
      <div class="checkbox"></div>
      <div class="invoice-item-content">
        <div class="invoice-item-body">
          ${detailRows}
          <div class="invoice-row">
            <span class="label">金额</span>
            <span class="amount">¥${item.amount.toFixed(2)}</span>
          </div>
        </div>
        <div class="invoice-item-footer">
          <button class="btn btn-sm btn-invoice">开具</button>
        </div>
      </div>
    </div>
  `;
}

// 渲染已开票列表（按业务类型分组）
function renderCompletedInvoices() {
  const container = document.getElementById('completed-invoice-list');
  if (!container) return;

  // 按业务类型分组
  const groupedData = {};
  completedInvoiceData.forEach(item => {
    if (!groupedData[item.type]) {
      groupedData[item.type] = [];
    }
    groupedData[item.type].push(item);
  });

  // 获取所有业务类型并按配置顺序排序
  const sortedTypes = Object.keys(businessTypes).sort((a, b) => {
    return (businessTypes[a]?.order || 99) - (businessTypes[b]?.order || 99);
  });

  let html = '';

  sortedTypes.forEach(type => {
    const items = groupedData[type] || [];
    const typeConfig = businessTypes[type] || { name: type, tagClass: '' };

    // 外部链接类型处理
    if (typeConfig.isExternal) {
      html += `
        <div class="invoice-group external-link" data-type="${type}">
          <div class="group-header" onclick="toggleCompletedGroup('${type}')">
            <div class="group-left">
              <span class="group-title">${typeConfig.name}</span>
            </div>
            <span class="group-arrow">›</span>
          </div>
        </div>
      `;
      return; // 跳过后续渲染
    }

    // 默认折叠
    const isExpanded = completedGroupExpandState[type] === true;

    html += `
      <div class="invoice-group" data-type="${type}">
        <div class="group-header" onclick="toggleCompletedGroup('${type}')">
          <div class="group-left">
            <span class="group-expand-icon ${isExpanded ? 'expanded' : ''}">▶</span>
            <span class="group-title">${typeConfig.name}</span>
            <span class="group-count">${items.length}条</span>
          </div>
        </div>
        <div class="group-content" style="display: ${isExpanded ? 'block' : 'none'}">
    `;

    // 如果有数据，渲染发票项；否则显示空状态
    if (items.length > 0) {
      items.forEach(item => {
        html += renderCompletedInvoiceItem(item, typeConfig);
      });
    } else {
      html += `
        <div class="group-empty">
          <span class="empty-text">暂无已开票数据</span>
        </div>
      `;
    }

    html += `
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  // 重新绑定复选框事件
  bindCompletedCheckboxEvents();
}

// 渲染单个已开票发票项
function renderCompletedInvoiceItem(item, typeConfig) {
  const invoiceTypeConfig = invoiceTypes[item.invoiceType] || { name: '普票', tagClass: 'tag-pupiao' };

  return `
    <div class="invoice-item completed-item" data-id="${item.id}" data-invoice-no="${item.invoiceNo}" data-type="${item.type}">
      <div class="invoice-item-header">
        <div class="checkbox"></div>
        <span class="tag ${invoiceTypeConfig.tagClass}">${invoiceTypeConfig.name}</span>
      </div>
      <div class="invoice-item-body">
        <div class="invoice-row">
          <span class="label">发票号码</span>
          <span class="value">${item.invoiceNo}</span>
        </div>
        <div class="invoice-row">
          <span class="label">开票日期</span>
          <span class="value">${item.invoiceDate}</span>
        </div>
        <div class="invoice-row">
          <span class="label">金额</span>
          <span class="amount">¥${item.amount.toFixed(2)}</span>
        </div>
      </div>
      <div class="invoice-item-footer">
        <button class="btn btn-sm btn-view" onclick="viewCompletedDetail(${item.id})">查看</button>
        <button class="btn btn-sm btn-email" onclick="sendEmail(${item.id})">发送邮箱</button>
      </div>
    </div>
  `;
}

// 切换已开票分组展开/折叠
function toggleCompletedGroup(type) {
  const typeConfig = businessTypes[type];

  // 外部链接类型：跳转到对应H5页面
  if (typeConfig && typeConfig.isExternal && typeConfig.externalUrl) {
    window.location.href = typeConfig.externalUrl;
    return;
  }

  completedGroupExpandState[type] = completedGroupExpandState[type] !== false ? false : true;
  renderCompletedInvoices();
}

// 绑定已开票复选框事件
function bindCompletedCheckboxEvents() {
  const itemCheckboxes = document.querySelectorAll('#completed-tab .invoice-item .checkbox');

  itemCheckboxes.forEach(checkbox => {
    checkbox.onclick = function(e) {
      e.stopPropagation();

      const currentItem = this.closest('.invoice-item');
      const currentType = currentItem ? currentItem.getAttribute('data-type') : null;
      const isChecked = this.classList.contains('checked');

      // 如果是取消选中，直接取消
      if (isChecked) {
        this.classList.remove('checked');
      } else {
        // 检查是否有其他业务类型的选中项
        const checkedItems = document.querySelectorAll('#completed-tab .invoice-item .checkbox.checked');
        let hasDifferentType = false;

        checkedItems.forEach(checkedBox => {
          const item = checkedBox.closest('.invoice-item');
          const type = item ? item.getAttribute('data-type') : null;
          if (type && type !== currentType) {
            hasDifferentType = true;
          }
        });

        // 如果有不同业务类型的选中项，先清除所有选中
        if (hasDifferentType) {
          checkedItems.forEach(checkedBox => {
            checkedBox.classList.remove('checked');
          });
        }

        // 选中当前项
        this.classList.add('checked');
      }

      updateCompletedSelectedInfo();
      updateCompletedBottomBar();
    };
  });
}

// 切换分组展开/折叠
function toggleGroup(type) {
  const typeConfig = businessTypes[type];

  // 外部链接类型：跳转到对应H5页面
  if (typeConfig && typeConfig.isExternal && typeConfig.externalUrl) {
    window.location.href = typeConfig.externalUrl;
    return;
  }

  groupExpandState[type] = groupExpandState[type] !== false ? false : true;
  renderPendingInvoices();
}

// 绑定复选框事件
function bindCheckboxEvents() {
  const itemCheckboxes = document.querySelectorAll('#pending-tab .invoice-item .checkbox');

  itemCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('click', function(e) {
      e.stopPropagation();

      const currentItem = this.closest('.invoice-item');
      const currentType = currentItem ? currentItem.getAttribute('data-type') : null;
      const isChecked = this.classList.contains('checked');

      // 如果是取消选中，直接取消
      if (isChecked) {
        this.classList.remove('checked');
      } else {
        // 违约金只允许单选
        if (currentType === 'weiyue') {
          // 先清除所有选中
          document.querySelectorAll('#pending-tab .invoice-item .checkbox.checked').forEach(checkedBox => {
            checkedBox.classList.remove('checked');
          });
        } else {
          // 其他类型：检查是否有其他业务类型的选中项
          const checkedItems = document.querySelectorAll('#pending-tab .invoice-item .checkbox.checked');
          let hasDifferentType = false;

          checkedItems.forEach(checkedBox => {
            const item = checkedBox.closest('.invoice-item');
            const type = item ? item.getAttribute('data-type') : null;
            if (type && type !== currentType) {
              hasDifferentType = true;
            }
          });

          // 如果有不同业务类型的选中项，先清除所有选中
          if (hasDifferentType) {
            checkedItems.forEach(checkedBox => {
              checkedBox.classList.remove('checked');
            });
          }
        }

        // 选中当前项
        this.classList.add('checked');
      }

      updateBottomBar();
    });
  });

  // 绑定开具按钮事件
  document.querySelectorAll('#pending-tab .btn-invoice').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const modalOverlay = document.getElementById('invoice-modal');
      if (modalOverlay) {
        modalOverlay.classList.add('show');
        document.body.style.overflow = 'hidden';
      }
    });
  });
}

// 更新底部操作栏显示状态
function updateBottomBar() {
  const checkedItems = document.querySelectorAll('#pending-tab .invoice-item .checkbox.checked');
  const bottomBar = document.getElementById('bottom-bar');
  const countEl = document.querySelector('#pending-tab .selected-info .count');
  const totalEl = document.querySelector('#pending-tab .selected-info .total');

  // 计算选中的业务类型
  const types = new Set();
  let total = 0;

  checkedItems.forEach(checkbox => {
    const item = checkbox.closest('.invoice-item');
    if (item) {
      const type = item.getAttribute('data-type');
      if (type) {
        types.add(type);
      }
      const amount = parseFloat(item.getAttribute('data-amount')) || 0;
      total += amount;
    }
  });

  // 更新选中信息
  if (countEl) {
    countEl.textContent = checkedItems.length;
  }
  if (totalEl) {
    totalEl.textContent = '¥' + total.toFixed(2);
  }

  // 只有选择了同一业务类型的多张发票时才显示底部栏
  if (checkedItems.length >= 2 && types.size === 1) {
    bottomBar.style.display = 'flex';
  } else {
    bottomBar.style.display = 'none';
  }
}

// 弹窗功能
function initModal() {
  const modalOverlay = document.getElementById('invoice-modal');
  const modalClose = document.querySelector('#invoice-modal .modal-close');
  const cancelBtn = document.querySelector('#invoice-modal .modal-footer .btn:not(.btn-primary)');

  // 关闭弹窗
  function closeModal() {
    if (modalOverlay) {
      modalOverlay.classList.remove('show');
      document.body.style.overflow = '';
    }
  }

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', function(e) {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });
  }
}

// 发票类型选择
function initInvoiceTypeSelector() {
  const typeOptions = document.querySelectorAll('.type-option');
  const zhuanpiaoFields = document.querySelectorAll('.zhuanpiao-field');

  typeOptions.forEach(option => {
    option.addEventListener('click', function() {
      typeOptions.forEach(o => o.classList.remove('active'));
      this.classList.add('active');

      const type = this.getAttribute('data-type');

      // 专票需要额外字段
      zhuanpiaoFields.forEach(field => {
        field.style.display = type === 'zhuanpiao' ? 'block' : 'none';
      });
    });
  });
}

// 确认开具（点击底部"开具"按钮）
function confirmBatchInvoice() {
  const checkedItems = document.querySelectorAll('#pending-tab .invoice-item .checkbox.checked');
  if (checkedItems.length === 0) {
    alert('请选择需要开具发票的项目');
    return;
  }

  // 检查是否为同一业务类型
  const types = new Set();
  checkedItems.forEach(checkbox => {
    const item = checkbox.closest('.invoice-item');
    if (item) {
      const type = item.getAttribute('data-type');
      if (type) {
        types.add(type);
      }
    }
  });

  if (types.size > 1) {
    alert('不同业务类型的发票不能一起开具，请选择同一业务类型的项目');
    return;
  }

  const modalOverlay = document.getElementById('invoice-modal');
  if (modalOverlay) {
    modalOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

// 确认开具
function confirmInvoice() {
  const checkedItems = document.querySelectorAll('#pending-tab .invoice-item .checkbox.checked');
  const count = checkedItems.length;

  alert(`成功开具 ${count} 张发票！`);

  const modalOverlay = document.getElementById('invoice-modal');
  if (modalOverlay) {
    modalOverlay.classList.remove('show');
    document.body.style.overflow = '';
  }

  // 清除所有选中状态
  const selectAllCheckbox = document.getElementById('select-all');
  if (selectAllCheckbox) {
    selectAllCheckbox.classList.remove('checked');
  }
  checkedItems.forEach(checkbox => {
    checkbox.classList.remove('checked');
  });
  updateSelectedInfo();
}

// 查看详情
function viewDetail(invoiceId) {
  window.location.href = 'detail.html?id=' + invoiceId;
}

// 搜索
function handleSearch() {
  // 模拟搜索功能
  console.log('执行搜索...');
}

// 重置筛选
function resetFilter() {
  const inputs = document.querySelectorAll('.filter-section input, .filter-section select');
  inputs.forEach(input => {
    if (input.type === 'select-one') {
      input.selectedIndex = 0;
    } else {
      input.value = '';
    }
  });
}

// 分页
function goToPage(page) {
  console.log('跳转到第', page, '页');
  // 实际项目中这里会重新加载数据
}

// ========== 已开票页面功能 ==========

// 取消选择（点击底部取消按钮）
function cancelCompletedSelectMode() {
  // 取消所有选中
  const checkboxes = document.querySelectorAll('#completed-tab .invoice-item .checkbox.checked');
  checkboxes.forEach(checkbox => {
    checkbox.classList.remove('checked');
  });

  // 隐藏底部操作栏
  const bottomBar = document.getElementById('completed-bottom-bar');
  if (bottomBar) {
    bottomBar.style.display = 'none';
  }

  // 重置选中信息
  updateCompletedSelectedInfo();
}

// 更新已开票选中信息
function updateCompletedSelectedInfo() {
  const checkedItems = document.querySelectorAll('#completed-tab .invoice-item .checkbox.checked');
  const countEl = document.querySelector('#completed-tab .selected-info .count');

  if (countEl) {
    countEl.textContent = checkedItems.length;
  }
}

// 更新已开票底部操作栏显示状态
function updateCompletedBottomBar() {
  const checkedItems = document.querySelectorAll('#completed-tab .invoice-item .checkbox.checked');
  const bottomBar = document.getElementById('completed-bottom-bar');

  // 计算选中的业务类型
  const types = new Set();

  checkedItems.forEach(checkbox => {
    const item = checkbox.closest('.invoice-item');
    if (item) {
      const type = item.getAttribute('data-type');
      if (type) {
        types.add(type);
      }
    }
  });

  // 只有选择了同一业务类型的多张发票时才显示底部栏
  if (checkedItems.length >= 2 && types.size === 1) {
    bottomBar.style.display = 'flex';
  } else {
    bottomBar.style.display = 'none';
  }
}

// 查看已开票详情
function viewCompletedDetail(invoiceId) {
  window.location.href = 'detail.html?id=' + invoiceId + '&type=completed';
}

// 发送邮箱（单个）
function sendEmail(invoiceId) {
  currentEmailInvoiceId = invoiceId;
  const invoiceItem = document.querySelector(`#completed-tab .invoice-item[data-id="${invoiceId}"]`);

  if (invoiceItem) {
    const invoiceNo = invoiceItem.getAttribute('data-invoice-no');
    const infoDiv = document.getElementById('email-invoice-info');
    if (infoDiv) {
      infoDiv.innerHTML = `
        <div class="info-row">
          <span class="info-label">发票号码</span>
          <span class="info-value">${invoiceNo}</span>
        </div>
      `;
    }
  }

  // 清空输入框
  document.getElementById('email-input').value = '';
  document.getElementById('email-remark').value = '';

  // 显示弹窗
  const modal = document.getElementById('email-modal');
  if (modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

// 关闭邮箱弹窗
function closeEmailModal() {
  const modal = document.getElementById('email-modal');
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
  currentEmailInvoiceId = null;
}

// 批量发送邮箱
function confirmBatchSendEmail() {
  const checkedItems = document.querySelectorAll('#completed-tab .invoice-item .checkbox.checked');

  if (checkedItems.length === 0) {
    alert('请选择需要发送的发票');
    return;
  }

  // 获取选中的发票号码
  const invoiceNos = [];
  checkedItems.forEach(checkbox => {
    const item = checkbox.closest('.invoice-item');
    if (item) {
      const invoiceNo = item.getAttribute('data-invoice-no');
      if (invoiceNo) {
        invoiceNos.push(invoiceNo);
      }
    }
  });

  // 显示批量发送信息
  const infoDiv = document.getElementById('email-invoice-info');
  if (infoDiv) {
    infoDiv.innerHTML = `
      <div class="info-row">
        <span class="info-label">发票数量</span>
        <span class="info-value">${invoiceNos.length} 张</span>
      </div>
      <div class="info-row">
        <span class="info-label">发票号码</span>
        <span class="info-value" style="font-size: 12px;">${invoiceNos.join(', ')}</span>
      </div>
    `;
  }

  // 设置标记为批量发送
  currentEmailInvoiceId = 'batch';

  // 清空输入框
  document.getElementById('email-input').value = '';
  document.getElementById('email-remark').value = '';

  // 显示弹窗
  const modal = document.getElementById('email-modal');
  if (modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

// 确认发送邮箱
function confirmSendEmail() {
  const emailInput = document.getElementById('email-input');
  const email = emailInput.value.trim();

  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    alert('请输入接收邮箱地址');
    return;
  }
  if (!emailRegex.test(email)) {
    alert('请输入正确的邮箱地址');
    return;
  }

  // 模拟发送
  if (currentEmailInvoiceId === 'batch') {
    alert('发票已批量发送至 ' + email);
  } else {
    alert('发票已发送至 ' + email);
  }

  closeEmailModal();

  // 如果是选择模式，退出选择模式
  if (isCompletedSelectMode) {
    cancelCompletedSelectMode();
  }
}
