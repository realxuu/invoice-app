// 发票详情页交互脚本

// 模拟发票数据
const invoiceData = {
  1: {
    invoiceNo: '24400190011112345678',
    invoiceType: '增值税普通发票',
    invoiceTypeTag: '普票',
    buyer: {
      name: '广州科技有限公司',
      taxNo: '91440101MA5CQ8X789',
      address: '广州市天河区天河路123号 020-88888888',
      bank: '中国工商银行广州分行 6222021234567890123'
    },
    seller: {
      name: '广州粤通科技有限公司',
      taxNo: '91440101MA5ABC1234',
      address: '广州市番禺区番禺大道北555号 020-12345678',
      bank: '中国建设银行广州分行 44050112345678901234'
    },
    items: [
      { name: 'ETC卡片工本费', spec: '-', unit: '张', qty: 1, price: 25.00, amount: 25.00 }
    ],
    totalAmount: 25.00,
    totalAmountCn: '贰拾伍元整',
    remark: '订单编号：GB202401150001',
    date: '2024年01月10日'
  },
  2: {
    invoiceNo: '24400190011112345679',
    invoiceType: '增值税专用发票',
    invoiceTypeTag: '专票',
    buyer: {
      name: '深圳科技集团有限公司',
      taxNo: '91440300MA5DGH1234',
      address: '深圳市南山区科技园路888号 0755-88888888',
      bank: '中国招商银行深圳分行 6225881234567890123'
    },
    seller: {
      name: '广州粤通科技有限公司',
      taxNo: '91440101MA5ABC1234',
      address: '广州市番禺区番禺大道北555号 020-12345678',
      bank: '中国建设银行广州分行 44050112345678901234'
    },
    items: [
      { name: '违约金', spec: '-', unit: '笔', qty: 1, price: 500.00, amount: 500.00 }
    ],
    totalAmount: 500.00,
    totalAmountCn: '伍佰元整',
    remark: '订单编号：WY202401090002',
    date: '2024年01月09日'
  },
  3: {
    invoiceNo: '24400190011112345680',
    invoiceType: '增值税普通发票',
    invoiceTypeTag: '普票',
    buyer: {
      name: '张三',
      taxNo: '440111199001011234',
      address: '-',
      bank: '-'
    },
    seller: {
      name: '广州粤通科技有限公司',
      taxNo: '91440101MA5ABC1234',
      address: '广州市番禺区番禺大道北555号 020-12345678',
      bank: '中国建设银行广州分行 44050112345678901234'
    },
    items: [
      { name: '停车费', spec: '-', unit: '次', qty: 1, price: 38.00, amount: 38.00 }
    ],
    totalAmount: 38.00,
    totalAmountCn: '叁拾捌元整',
    remark: '车牌号：粤A12345 停车时长：2小时25分',
    date: '2024年01月08日'
  },
  4: {
    invoiceNo: '24400190011112345681',
    invoiceType: '增值税专用发票',
    invoiceTypeTag: '专票',
    buyer: {
      name: '广东智能科技有限公司',
      taxNo: '91440101MA5XYZ5678',
      address: '广州市黄埔区科学城大道100号 020-66666666',
      bank: '中国银行广州分行 6216611234567890123'
    },
    seller: {
      name: '广州粤通科技有限公司',
      taxNo: '91440101MA5ABC1234',
      address: '广州市番禺区番禺大道北555号 020-12345678',
      bank: '中国建设银行广州分行 44050112345678901234'
    },
    items: [
      { name: '权益及服务费', spec: '-', unit: '项', qty: 1, price: 128.00, amount: 128.00 }
    ],
    totalAmount: 128.00,
    totalAmountCn: '壹佰贰拾捌元整',
    remark: '产品号：QY202401120008',
    date: '2024年01月07日'
  },
  5: {
    invoiceNo: '24400190011112345682',
    invoiceType: '增值税普通发票',
    invoiceTypeTag: '普票',
    buyer: {
      name: '李四',
      taxNo: '440111199202025678',
      address: '-',
      bank: '-'
    },
    seller: {
      name: '广州粤通科技有限公司',
      taxNo: '91440101MA5ABC1234',
      address: '广州市番禺区番禺大道北555号 020-12345678',
      bank: '中国建设银行广州分行 44050112345678901234'
    },
    items: [
      { name: '车载香水套装', spec: '50ml*2', unit: '套', qty: 1, price: 256.50, amount: 256.50 }
    ],
    totalAmount: 256.50,
    totalAmountCn: '贰佰伍拾陆元伍角整',
    remark: '订单号：YT202401110021',
    date: '2024年01月06日'
  }
};

// 当前发票ID
let currentInvoiceId = null;

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
  // 获取URL参数
  const urlParams = new URLSearchParams(window.location.search);
  const invoiceId = urlParams.get('id');

  if (invoiceId && invoiceData[invoiceId]) {
    currentInvoiceId = invoiceId;
    renderInvoice(invoiceData[invoiceId]);
  }
});

// 渲染发票数据
function renderInvoice(data) {
  // 发票信息
  document.getElementById('invoice-type').textContent = data.invoiceType;
  document.getElementById('invoice-no').textContent = data.invoiceNo;

  // 购买方信息
  document.getElementById('buyer-name').textContent = data.buyer.name;
  document.getElementById('buyer-tax-no').textContent = data.buyer.taxNo;
  document.getElementById('buyer-address').textContent = data.buyer.address;
  document.getElementById('buyer-bank').textContent = data.buyer.bank;

  // 销售方信息
  document.getElementById('seller-name').textContent = data.seller.name;
  document.getElementById('seller-tax-no').textContent = data.seller.taxNo;
  document.getElementById('seller-address').textContent = data.seller.address;
  document.getElementById('seller-bank').textContent = data.seller.bank;

  // 商品明细
  const itemsBody = document.getElementById('invoice-items-body');
  itemsBody.innerHTML = data.items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td>${item.spec}</td>
      <td>${item.unit}</td>
      <td>${item.qty}</td>
      <td>¥${item.price.toFixed(2)}</td>
      <td>¥${item.amount.toFixed(2)}</td>
    </tr>
  `).join('');

  // 合计金额
  document.getElementById('total-amount').textContent = '¥' + data.totalAmount.toFixed(2);
  document.getElementById('total-amount-cn').textContent = data.totalAmountCn;

  // 备注
  document.getElementById('invoice-remark').textContent = data.remark;

  // 开票日期
  document.getElementById('invoice-date').textContent = data.date;

  // 更新邮箱弹窗中的发票号码
  document.getElementById('detail-email-invoice-no').textContent = data.invoiceNo;
}

// 显示下载弹窗
function showDownloadModal() {
  const modal = document.getElementById('download-modal');
  if (modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

// 关闭下载弹窗
function closeDownloadModal() {
  const modal = document.getElementById('download-modal');
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
}

// 下载发票
function downloadInvoice(format) {
  const data = invoiceData[currentInvoiceId];
  if (!data) return;

  // 模拟下载
  const fileName = `发票_${data.invoiceNo}.${format.toUpperCase()}`;
  alert(`正在下载 ${fileName}\n\n（演示功能，实际项目中会触发文件下载）`);

  closeDownloadModal();
}

// 显示邮箱弹窗
function showDetailEmailModal() {
  const modal = document.getElementById('detail-email-modal');
  if (modal) {
    // 清空邮箱输入
    document.getElementById('detail-email-input').value = '';
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

// 关闭邮箱弹窗
function closeDetailEmailModal() {
  const modal = document.getElementById('detail-email-modal');
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
}

// 确认发送邮箱
function confirmDetailSendEmail() {
  const emailInput = document.getElementById('detail-email-input');
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

  // 获取选择的格式
  const format = document.querySelector('input[name="email-format"]:checked').value;
  const data = invoiceData[currentInvoiceId];

  // 模拟发送
  alert(`发票已发送至 ${email}\n格式：${format.toUpperCase()}\n发票号码：${data.invoiceNo}`);

  closeDetailEmailModal();
}
