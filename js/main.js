// 发票开具APP交互脚本

// 选择模式状态
let isSelectMode = false;
let isCompletedSelectMode = false;

// 当前发送邮箱的发票ID（单个发送时使用）
let currentEmailInvoiceId = null;

document.addEventListener('DOMContentLoaded', function() {
  // 初始化标签页切换
  initTabs();

  // 初始化复选框
  initCheckboxes();

  // 初始化已开票复选框
  initCompletedCheckboxes();

  // 初始化弹窗
  initModal();

  // 初始化发票类型选择
  initInvoiceTypeSelector();

  // 加载模拟数据
  loadMockData();
});

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

      // 切换标签页时退出选择模式
      if (isSelectMode) {
        cancelSelectMode();
      }
      if (isCompletedSelectMode) {
        cancelCompletedSelectMode();
      }
    });
  });
}

// 切换选择模式
function toggleSelectMode() {
  if (!isSelectMode) {
    enterSelectMode();
  }
}

// 进入选择模式
function enterSelectMode() {
  isSelectMode = true;

  // 显示勾选框
  const checkboxes = document.querySelectorAll('#pending-tab .invoice-item .checkbox');
  checkboxes.forEach(checkbox => {
    checkbox.classList.remove('hidden');
  });

  // 列表项添加选择模式样式
  const invoiceItems = document.querySelectorAll('#pending-tab .invoice-item');
  invoiceItems.forEach(item => {
    item.classList.add('select-mode');
  });

  // 显示全选功能
  const listHeader = document.getElementById('list-header');
  if (listHeader) {
    listHeader.classList.add('select-mode');
  }

  // 底部操作栏进入选择模式
  const bottomBar = document.getElementById('bottom-bar');
  if (bottomBar) {
    bottomBar.classList.add('select-mode');
  }

  // 修改按钮文字
  const confirmBtn = document.getElementById('confirm-btn');
  if (confirmBtn) {
    confirmBtn.textContent = '确认开具';
  }
}

// 退出选择模式
function cancelSelectMode() {
  isSelectMode = false;

  // 隐藏勾选框并取消选中
  const checkboxes = document.querySelectorAll('#pending-tab .invoice-item .checkbox');
  checkboxes.forEach(checkbox => {
    checkbox.classList.add('hidden');
    checkbox.classList.remove('checked');
  });

  // 列表项移除选择模式样式
  const invoiceItems = document.querySelectorAll('#pending-tab .invoice-item');
  invoiceItems.forEach(item => {
    item.classList.remove('select-mode');
  });

  // 隐藏全选功能
  const listHeader = document.getElementById('list-header');
  if (listHeader) {
    listHeader.classList.remove('select-mode');
  }

  // 取消全选状态
  const selectAllCheckbox = document.getElementById('select-all');
  if (selectAllCheckbox) {
    selectAllCheckbox.classList.remove('checked');
  }

  // 底部操作栏退出选择模式
  const bottomBar = document.getElementById('bottom-bar');
  if (bottomBar) {
    bottomBar.classList.remove('select-mode');
  }

  // 恢复按钮文字
  const confirmBtn = document.getElementById('confirm-btn');
  if (confirmBtn) {
    confirmBtn.textContent = '批量开具';
  }

  // 重置选中信息
  updateSelectedInfo();
}

// 复选框功能
function initCheckboxes() {
  // 全选功能
  const selectAllCheckbox = document.getElementById('select-all');
  const itemCheckboxes = document.querySelectorAll('#pending-tab .invoice-item .checkbox');

  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('click', function() {
      const isChecked = !this.classList.contains('checked');
      this.classList.toggle('checked', isChecked);

      itemCheckboxes.forEach(checkbox => {
        checkbox.classList.toggle('checked', isChecked);
      });

      updateSelectedInfo();
    });
  }

  // 单项选择
  itemCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('click', function() {
      this.classList.toggle('checked');
      updateSelectedInfo();

      // 更新全选状态
      if (selectAllCheckbox) {
        const allChecked = document.querySelectorAll('#pending-tab .invoice-item .checkbox.checked').length === itemCheckboxes.length;
        selectAllCheckbox.classList.toggle('checked', allChecked);
      }
    });
  });
}

// 更新选中信息
function updateSelectedInfo() {
  const checkedItems = document.querySelectorAll('#pending-tab .invoice-item .checkbox.checked');
  const countEl = document.querySelector('#pending-tab .selected-info .count');
  const totalEl = document.querySelector('#pending-tab .selected-info .total');

  if (countEl) {
    countEl.textContent = checkedItems.length;
  }

  if (totalEl) {
    let total = 0;
    checkedItems.forEach(checkbox => {
      const item = checkbox.closest('.invoice-item');
      if (item) {
        const amount = parseFloat(item.getAttribute('data-amount')) || 0;
        total += amount;
      }
    });
    totalEl.textContent = '¥' + total.toFixed(2);
  }
}

// 弹窗功能
function initModal() {
  const modalOverlay = document.getElementById('invoice-modal');
  const modalClose = document.querySelector('.modal-close');
  const cancelBtn = document.querySelector('.modal-footer .btn:not(.btn-primary)');

  // 打开弹窗 - 单个开具按钮
  document.querySelectorAll('#pending-tab .btn-invoice').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      if (modalOverlay) {
        modalOverlay.classList.add('show');
        document.body.style.overflow = 'hidden';
      }
    });
  });

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

// 加载模拟数据
function loadMockData() {
  // 待开票数据
  const pendingData = [
    { id: 1, type: 'gongben', typeName: '工本费', productNo: 'GB202401150001', amount: 25.00, time: '2024-01-15 10:30:22' },
    { id: 2, type: 'weiyue', typeName: '违约金', bankAccount: '6222 **** **** 1234', amount: 50.00, time: '2024-01-14 16:45:10' },
    { id: 3, type: 'tingche', typeName: '停车费', plateNo: '粤A12345', entryTime: '2024-01-13 09:20:35', exitTime: '2024-01-13 11:45:20', amount: 38.00 },
    { id: 4, type: 'quanyi', typeName: '权益及服务', productNo: 'QY202401120008', amount: 128.00, time: '2024-01-12 14:15:48' },
    { id: 5, type: 'yuetong', typeName: '粤通商城', orderNo: 'YT202401110021', productName: '车载香水套装', amount: 256.50, time: '2024-01-11 11:30:00' },
  ];

  // 已开票数据
  const completedData = [
    { id: 1, invoiceNo: '24400190011112345678', type: 'pupiao', typeName: '普票', bizType: '工本费', buyer: '广州科技有限公司', date: '2024-01-10', amount: 25.00 },
    { id: 2, invoiceNo: '24400190011112345679', type: 'zhuanpiao', typeName: '专票', bizType: '违约金', buyer: '深圳科技集团有限公司', date: '2024-01-09', amount: 500.00 },
    { id: 3, invoiceNo: '24400190011112345680', type: 'pupiao', typeName: '普票', bizType: '停车费', buyer: '张三', date: '2024-01-08', amount: 38.00 },
    { id: 4, invoiceNo: '24400190011112345681', type: 'zhuanpiao', typeName: '专票', bizType: '权益及服务', buyer: '广东智能科技有限公司', date: '2024-01-07', amount: 128.00 },
    { id: 5, invoiceNo: '24400190011112345682', type: 'pupiao', typeName: '普票', bizType: '粤通商城', buyer: '李四', date: '2024-01-06', amount: 256.50 },
  ];
}

// 批量开具（点击批量开具按钮进入选择模式）
function batchInvoice() {
  enterSelectMode();
}

// 确认批量开具
function confirmBatchInvoice() {
  if (!isSelectMode) {
    // 默认状态点击"批量开具"进入选择模式
    enterSelectMode();
    return;
  }

  // 选择模式下点击"确认开具"
  const checkedItems = document.querySelectorAll('#pending-tab .invoice-item .checkbox.checked');
  if (checkedItems.length === 0) {
    alert('请选择需要开具发票的项目');
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
  alert('发票开具成功！');
  const modalOverlay = document.getElementById('invoice-modal');
  if (modalOverlay) {
    modalOverlay.classList.remove('show');
    document.body.style.overflow = '';
  }
  // 开具成功后退出选择模式
  cancelSelectMode();
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

// 已开票页面选择模式切换
function toggleCompletedSelectMode() {
  if (!isCompletedSelectMode) {
    enterCompletedSelectMode();
  } else {
    confirmBatchSendEmail();
  }
}

// 进入已开票选择模式
function enterCompletedSelectMode() {
  isCompletedSelectMode = true;

  // 显示勾选框
  const checkboxes = document.querySelectorAll('#completed-tab .invoice-item .checkbox');
  checkboxes.forEach(checkbox => {
    checkbox.classList.remove('hidden');
  });

  // 列表项添加选择模式样式
  const invoiceItems = document.querySelectorAll('#completed-tab .invoice-item');
  invoiceItems.forEach(item => {
    item.classList.add('select-mode');
  });

  // 显示全选功能
  const listHeader = document.getElementById('completed-list-header');
  if (listHeader) {
    listHeader.classList.add('select-mode');
  }

  // 底部操作栏进入选择模式
  const bottomBar = document.getElementById('completed-bottom-bar');
  if (bottomBar) {
    bottomBar.classList.add('select-mode');
  }

  // 修改按钮文字
  const confirmBtn = document.getElementById('completed-confirm-btn');
  if (confirmBtn) {
    confirmBtn.textContent = '确认发送';
  }
}

// 退出已开票选择模式
function cancelCompletedSelectMode() {
  isCompletedSelectMode = false;

  // 隐藏勾选框并取消选中
  const checkboxes = document.querySelectorAll('#completed-tab .invoice-item .checkbox');
  checkboxes.forEach(checkbox => {
    checkbox.classList.add('hidden');
    checkbox.classList.remove('checked');
  });

  // 列表项移除选择模式样式
  const invoiceItems = document.querySelectorAll('#completed-tab .invoice-item');
  invoiceItems.forEach(item => {
    item.classList.remove('select-mode');
  });

  // 隐藏全选功能
  const listHeader = document.getElementById('completed-list-header');
  if (listHeader) {
    listHeader.classList.remove('select-mode');
  }

  // 取消全选状态
  const selectAllCheckbox = document.getElementById('completed-select-all');
  if (selectAllCheckbox) {
    selectAllCheckbox.classList.remove('checked');
  }

  // 底部操作栏退出选择模式
  const bottomBar = document.getElementById('completed-bottom-bar');
  if (bottomBar) {
    bottomBar.classList.remove('select-mode');
  }

  // 恢复按钮文字
  const confirmBtn = document.getElementById('completed-confirm-btn');
  if (confirmBtn) {
    confirmBtn.textContent = '批量发送';
  }

  // 重置选中信息
  updateCompletedSelectedInfo();
}

// 已开票复选框功能
function initCompletedCheckboxes() {
  // 全选功能
  const selectAllCheckbox = document.getElementById('completed-select-all');
  const itemCheckboxes = document.querySelectorAll('#completed-tab .invoice-item .checkbox');

  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('click', function() {
      const isChecked = !this.classList.contains('checked');
      this.classList.toggle('checked', isChecked);

      itemCheckboxes.forEach(checkbox => {
        checkbox.classList.toggle('checked', isChecked);
      });

      updateCompletedSelectedInfo();
    });
  }

  // 单项选择
  itemCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('click', function(e) {
      e.stopPropagation();
      this.classList.toggle('checked');
      updateCompletedSelectedInfo();

      // 更新全选状态
      if (selectAllCheckbox) {
        const allChecked = document.querySelectorAll('#completed-tab .invoice-item .checkbox.checked').length === itemCheckboxes.length;
        selectAllCheckbox.classList.toggle('checked', allChecked);
      }
    });
  });
}

// 更新已开票选中信息
function updateCompletedSelectedInfo() {
  const checkedItems = document.querySelectorAll('#completed-tab .invoice-item .checkbox.checked');
  const countEl = document.querySelector('#completed-tab .selected-info .count');

  if (countEl) {
    countEl.textContent = checkedItems.length;
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
