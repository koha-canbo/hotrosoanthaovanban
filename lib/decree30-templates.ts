/**
 * Decree 30/2020/NĐ-CP compliant document templates.
 * Each template provides the standard header structure for Vietnamese administrative documents.
 */

export interface DocumentType {
  id: string;
  label: string;
  labelVi: string;
  template: string;
}

export const DOCUMENT_TYPES: DocumentType[] = [
  {
    id: "cong_van",
    label: "Công văn",
    labelVi: "Công văn",
    template: generateCongVanTemplate(),
  },
  {
    id: "to_trinh",
    label: "Tờ trình",
    labelVi: "Tờ trình",
    template: generateToTrinhTemplate(),
  },
  {
    id: "quyet_dinh",
    label: "Quyết định",
    labelVi: "Quyết định",
    template: generateQuyetDinhTemplate(),
  },
  {
    id: "bao_cao",
    label: "Báo cáo",
    labelVi: "Báo cáo",
    template: generateBaoCaoTemplate(),
  },
  {
    id: "thong_bao",
    label: "Thông báo",
    labelVi: "Thông báo",
    template: generateThongBaoTemplate(),
  },
  {
    id: "ke_hoach",
    label: "Kế hoạch",
    labelVi: "Kế hoạch",
    template: generateKeHoachTemplate(),
  },
  {
    id: "custom",
    label: "Theo mẫu đính kèm",
    labelVi: "Theo mẫu đính kèm",
    template: `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-tertiary);min-height:250mm;"><p><em>Hãy cung cấp tài liệu mẫu (tải file hoặc dán văn bản) và nhấn "Tạo văn bản". AI sẽ tự động phân tích và tạo biểu mẫu dựa trên cấu trúc tài liệu của bạn.</em></p></div>`,
  },
];

function getDecreeHeader(docNumberPrefix: string): string {
  return `<table class="decree-header-table" style="width:100%;border:none;border-collapse:collapse;margin-bottom:12pt;">
  <tr>
    <td style="width:40%;text-align:center;vertical-align:top;border:none;padding:0;">
      <p style="margin:0;font-size:13pt;text-transform:uppercase;">CÔNG AN TỈNH ĐẮK LẮK</p>
      <p style="margin:0;font-size:13pt;font-weight:bold;text-transform:uppercase;">TÊN CƠ QUAN BAN HÀNH</p>
      <p style="margin:8pt 0 0;font-size:13pt;">Số: .../${docNumberPrefix}-...</p>
    </td>
    <td style="width:60%;text-align:center;vertical-align:top;border:none;padding:0;">
      <p style="margin:0;font-size:13pt;font-weight:bold;text-transform:uppercase;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
      <p style="margin:0;font-size:14pt;font-weight:bold;"><span style="border-bottom:2px solid #000;padding-bottom:2pt;">Độc lập - Tự do - Hạnh phúc</span></p>
      <p style="margin:8pt 0 0;font-size:13pt;font-style:italic;">........, ngày ... tháng ... năm 20...</p>
    </td>
  </tr>
</table>`;
}

function generateCongVanTemplate(): string {
  return `${getDecreeHeader("CV")}
<p style="text-align:center;font-weight:bold;font-size:14pt;margin:16pt 0 8pt;">V/v: ................................................................</p>
<p style="margin:12pt 0 6pt;"><strong>Kính gửi:</strong> ................................................................</p>
<p style="text-indent:1.27cm;">Căn cứ vào ................................................................</p>
<p style="text-indent:1.27cm;">[Nội dung công văn được tạo tự động sẽ xuất hiện ở đây]</p>
<p style="text-indent:1.27cm;">Trân trọng kính gửi và đề nghị quý cơ quan xem xét, giải quyết.</p>
<p style="margin:24pt 0 0;"></p>
<table class="decree-signature-table" style="width:100%;border:none;border-collapse:collapse;">
  <tr>
    <td style="width:50%;vertical-align:top;border:none;padding:0;">
      <p style="margin:0;font-size:12pt;font-style:italic;"><strong>Nơi nhận:</strong></p>
      <p style="margin:0;font-size:11pt;">- Như trên;</p>
      <p style="margin:0;font-size:11pt;">- Lưu: VT, ...</p>
    </td>
    <td style="width:50%;text-align:center;vertical-align:top;border:none;padding:0;">
      <p style="margin:0;font-size:13pt;font-weight:bold;text-transform:uppercase;">CHỨC VỤ NGƯỜI KÝ</p>
      <p style="margin:0;font-size:12pt;font-style:italic;">(Ký, ghi rõ họ tên)</p>
      <p style="margin:48pt 0 0;font-size:13pt;font-weight:bold;">Họ và Tên</p>
    </td>
  </tr>
</table>`;
}

function generateToTrinhTemplate(): string {
  return `${getDecreeHeader("TTr")}
<h1 style="text-align:center;font-weight:bold;font-size:14pt;margin:16pt 0 4pt;text-transform:uppercase;">TỜ TRÌNH</h1>
<p style="text-align:center;font-weight:bold;font-size:14pt;margin:0 0 16pt;">V/v: ................................................................</p>
<p style="margin:12pt 0 6pt;"><strong>Kính gửi:</strong> ................................................................</p>
<p style="font-weight:bold;margin:12pt 0 4pt;">I. SỰ CẦN THIẾT VÀ CĂN CỨ PHÁP LÝ</p>
<p style="text-indent:1.27cm;">Căn cứ ................................................................</p>
<p style="font-weight:bold;margin:12pt 0 4pt;">II. NỘI DUNG ĐỀ XUẤT</p>
<p style="text-indent:1.27cm;">[Nội dung tờ trình được tạo tự động sẽ xuất hiện ở đây]</p>
<p style="font-weight:bold;margin:12pt 0 4pt;">III. KIẾN NGHỊ</p>
<p style="text-indent:1.27cm;">Kính trình ................................................................ xem xét, phê duyệt.</p>
<p style="margin:24pt 0 0;"></p>
<table class="decree-signature-table" style="width:100%;border:none;border-collapse:collapse;">
  <tr>
    <td style="width:50%;vertical-align:top;border:none;padding:0;">
      <p style="margin:0;font-size:12pt;font-style:italic;"><strong>Nơi nhận:</strong></p>
      <p style="margin:0;font-size:11pt;">- Như trên;</p>
      <p style="margin:0;font-size:11pt;">- Lưu: VT, ...</p>
    </td>
    <td style="width:50%;text-align:center;vertical-align:top;border:none;padding:0;">
      <p style="margin:0;font-size:13pt;font-weight:bold;text-transform:uppercase;">CHỨC VỤ NGƯỜI KÝ</p>
      <p style="margin:0;font-size:12pt;font-style:italic;">(Ký, ghi rõ họ tên)</p>
      <p style="margin:48pt 0 0;font-size:13pt;font-weight:bold;">Họ và Tên</p>
    </td>
  </tr>
</table>`;
}

function generateQuyetDinhTemplate(): string {
  return `${getDecreeHeader("QĐ")}
<h1 style="text-align:center;font-weight:bold;font-size:14pt;margin:16pt 0 4pt;text-transform:uppercase;">QUYẾT ĐỊNH</h1>
<p style="text-align:center;font-weight:bold;font-size:14pt;margin:0 0 16pt;">V/v: ................................................................</p>
<p style="text-align:center;font-weight:bold;font-size:13pt;text-transform:uppercase;margin:0 0 12pt;">CHỨC VỤ NGƯỜI BAN HÀNH QUYẾT ĐỊNH</p>
<p style="text-indent:1.27cm;">Căn cứ ................................................................;</p>
<p style="text-indent:1.27cm;">Căn cứ ................................................................;</p>
<p style="text-indent:1.27cm;">Theo đề nghị của ................................................................,</p>
<p style="text-align:center;font-weight:bold;font-size:14pt;margin:16pt 0 8pt;">QUYẾT ĐỊNH:</p>
<p style="text-indent:1.27cm;"><strong>Điều 1.</strong> ................................................................</p>
<p style="text-indent:1.27cm;"><strong>Điều 2.</strong> ................................................................</p>
<p style="text-indent:1.27cm;"><strong>Điều 3.</strong> Quyết định này có hiệu lực thi hành kể từ ngày ký.</p>
<p style="margin:24pt 0 0;"></p>
<table class="decree-signature-table" style="width:100%;border:none;border-collapse:collapse;">
  <tr>
    <td style="width:50%;vertical-align:top;border:none;padding:0;">
      <p style="margin:0;font-size:12pt;font-style:italic;"><strong>Nơi nhận:</strong></p>
      <p style="margin:0;font-size:11pt;">- Như Điều 3;</p>
      <p style="margin:0;font-size:11pt;">- Lưu: VT, ...</p>
    </td>
    <td style="width:50%;text-align:center;vertical-align:top;border:none;padding:0;">
      <p style="margin:0;font-size:13pt;font-weight:bold;text-transform:uppercase;">CHỨC VỤ NGƯỜI KÝ</p>
      <p style="margin:0;font-size:12pt;font-style:italic;">(Ký, đóng dấu, ghi rõ họ tên)</p>
      <p style="margin:48pt 0 0;font-size:13pt;font-weight:bold;">Họ và Tên</p>
    </td>
  </tr>
</table>`;
}

function generateBaoCaoTemplate(): string {
  return `${getDecreeHeader("BC")}
<h1 style="text-align:center;font-weight:bold;font-size:14pt;margin:16pt 0 4pt;text-transform:uppercase;">BÁO CÁO</h1>
<p style="text-align:center;font-weight:bold;font-size:14pt;margin:0 0 16pt;">V/v: ................................................................</p>
<p style="margin:12pt 0 6pt;"><strong>Kính gửi:</strong> ................................................................</p>
<p style="font-weight:bold;margin:12pt 0 4pt;">I. TÌNH HÌNH THỰC TẾ</p>
<p style="text-indent:1.27cm;">[Nội dung báo cáo được tạo tự động sẽ xuất hiện ở đây]</p>
<p style="font-weight:bold;margin:12pt 0 4pt;">II. KẾT QUẢ ĐẠT ĐƯỢC</p>
<p style="text-indent:1.27cm;">................................................................</p>
<p style="font-weight:bold;margin:12pt 0 4pt;">III. TỒN TẠI, HẠN CHẾ</p>
<p style="text-indent:1.27cm;">................................................................</p>
<p style="font-weight:bold;margin:12pt 0 4pt;">IV. PHƯƠNG HƯỚNG, KIẾN NGHỊ</p>
<p style="text-indent:1.27cm;">................................................................</p>
<p style="margin:24pt 0 0;"></p>
<table class="decree-signature-table" style="width:100%;border:none;border-collapse:collapse;">
  <tr>
    <td style="width:50%;vertical-align:top;border:none;padding:0;">
      <p style="margin:0;font-size:12pt;font-style:italic;"><strong>Nơi nhận:</strong></p>
      <p style="margin:0;font-size:11pt;">- Như trên;</p>
      <p style="margin:0;font-size:11pt;">- Lưu: VT, ...</p>
    </td>
    <td style="width:50%;text-align:center;vertical-align:top;border:none;padding:0;">
      <p style="margin:0;font-size:13pt;font-weight:bold;text-transform:uppercase;">CHỨC VỤ NGƯỜI KÝ</p>
      <p style="margin:0;font-size:12pt;font-style:italic;">(Ký, ghi rõ họ tên)</p>
      <p style="margin:48pt 0 0;font-size:13pt;font-weight:bold;">Họ và Tên</p>
    </td>
  </tr>
</table>`;
}

function generateThongBaoTemplate(): string {
  return `${getDecreeHeader("TB")}
<h1 style="text-align:center;font-weight:bold;font-size:14pt;margin:16pt 0 4pt;text-transform:uppercase;">THÔNG BÁO</h1>
<p style="text-align:center;font-weight:bold;font-size:14pt;margin:0 0 16pt;">V/v: ................................................................</p>
<p style="text-indent:1.27cm;">[Nội dung thông báo được tạo tự động sẽ xuất hiện ở đây]</p>
<p style="text-indent:1.27cm;">Trân trọng thông báo để các đơn vị, cá nhân liên quan biết và thực hiện.</p>
<p style="margin:24pt 0 0;"></p>
<table class="decree-signature-table" style="width:100%;border:none;border-collapse:collapse;">
  <tr>
    <td style="width:50%;vertical-align:top;border:none;padding:0;">
      <p style="margin:0;font-size:12pt;font-style:italic;"><strong>Nơi nhận:</strong></p>
      <p style="margin:0;font-size:11pt;">- Các đơn vị liên quan;</p>
      <p style="margin:0;font-size:11pt;">- Lưu: VT, ...</p>
    </td>
    <td style="width:50%;text-align:center;vertical-align:top;border:none;padding:0;">
      <p style="margin:0;font-size:13pt;font-weight:bold;text-transform:uppercase;">CHỨC VỤ NGƯỜI KÝ</p>
      <p style="margin:0;font-size:12pt;font-style:italic;">(Ký, ghi rõ họ tên)</p>
      <p style="margin:48pt 0 0;font-size:13pt;font-weight:bold;">Họ và Tên</p>
    </td>
  </tr>
</table>`;
}

function generateKeHoachTemplate(): string {
  return `${getDecreeHeader("KH")}
<h1 style="text-align:center;font-weight:bold;font-size:14pt;margin:16pt 0 4pt;text-transform:uppercase;">KẾ HOẠCH</h1>
<p style="text-align:center;font-weight:bold;font-size:14pt;margin:0 0 16pt;">V/v: ................................................................</p>
<p style="font-weight:bold;margin:12pt 0 4pt;">I. MỤC ĐÍCH, YÊU CẦU</p>
<p style="text-indent:1.27cm;">................................................................</p>
<p style="font-weight:bold;margin:12pt 0 4pt;">II. NỘI DUNG KẾ HOẠCH</p>
<p style="text-indent:1.27cm;">[Nội dung kế hoạch được tạo tự động sẽ xuất hiện ở đây]</p>
<p style="font-weight:bold;margin:12pt 0 4pt;">III. TỔ CHỨC THỰC HIỆN</p>
<p style="text-indent:1.27cm;">................................................................</p>
<p style="font-weight:bold;margin:12pt 0 4pt;">IV. KINH PHÍ THỰC HIỆN</p>
<p style="text-indent:1.27cm;">................................................................</p>
<p style="margin:24pt 0 0;"></p>
<table class="decree-signature-table" style="width:100%;border:none;border-collapse:collapse;">
  <tr>
    <td style="width:50%;vertical-align:top;border:none;padding:0;">
      <p style="margin:0;font-size:12pt;font-style:italic;"><strong>Nơi nhận:</strong></p>
      <p style="margin:0;font-size:11pt;">- Các đơn vị liên quan;</p>
      <p style="margin:0;font-size:11pt;">- Lưu: VT, ...</p>
    </td>
    <td style="width:50%;text-align:center;vertical-align:top;border:none;padding:0;">
      <p style="margin:0;font-size:13pt;font-weight:bold;text-transform:uppercase;">CHỨC VỤ NGƯỜI KÝ</p>
      <p style="margin:0;font-size:12pt;font-style:italic;">(Ký, ghi rõ họ tên)</p>
      <p style="margin:48pt 0 0;font-size:13pt;font-weight:bold;">Họ và Tên</p>
    </td>
  </tr>
</table>`;
}
