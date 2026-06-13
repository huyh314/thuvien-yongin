import React, { useState } from 'react';
import { Card, Form, Input, Button, Select, message, Row, Col, Typography, Tag, Divider, Space, Modal, Descriptions, InputNumber } from 'antd';
import { BookOutlined, ThunderboltOutlined, EyeOutlined } from '@ant-design/icons';
import apiClient from '@yongin/api/src/client';

const CatalogingPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [cutterResult, setCutterResult] = useState<string | null>(null);
  const [duplicateResult, setDuplicateResult] = useState<any>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [authors, setAuthors] = useState<{ label: string; value: string }[]>([]);

  const handleCheckDuplicate = async () => {
    const title = form.getFieldValue('title');
    const author = form.getFieldValue('author');
    if (!title) return message.warning('Nhập nhan đề trước');
    try {
      const { data } = await apiClient.post('/cataloging/search-duplicate', { title, author, year: form.getFieldValue('year') });
      setDuplicateResult(data);
      message.info(data.duplicate ? `Tìm thấy ${data.matches.length} biểu ghi trùng` : 'Không tìm thấy trùng');
    } catch { message.error('Lỗi tra trùng'); }
  };

  const handleGenerateCutter = async () => {
    const title = form.getFieldValue('title');
    if (!title) return message.warning('Nhập tên sách trước');
    try {
      const { data } = await apiClient.post('/cataloging/generate-cutter', { title });
      setCutterResult(data.cutter);
    } catch { message.error('Lỗi sinh Cutter'); }
  };

  const handleSearchAuthor = async (q: string) => {
    if (q.length < 2) return;
    try {
      const { data } = await apiClient.get(`/cataloging/records/search?q=${encodeURIComponent(q)}&limit=5`);
        if (data?.results) {
          const authorNames: string[] = (data.results || []).map((r: any) => r.author_main).filter((x: string | null) => x && x.length > 0);
          const unique = [...new Set(authorNames)];
          setAuthors(unique.map((a) => ({ label: a, value: a })));
      }
    } catch { /* silent */ }
  };

  const buildFields = (values: any) => {
    const fields: any = {};
    if (values.title) fields['245'] = [{ ind1: '1', ind2: '0', subfields: { a: values.title, c: values.author || '' } }];
    if (values.author) fields['100'] = [{ ind1: '1', ind2: '#', subfields: { a: values.author } }];
    if (values.publisher) fields['260'] = [{ ind1: '#', ind2: '#', subfields: { a: values.publisherPlace || 'Hà Nội', b: values.publisher, c: values.year?.toString() || '2025' } }];
    if (values.isbn) fields['020'] = [{ ind1: '#', ind2: '#', subfields: { a: values.isbn, c: values.price || '', d: values.copiesCount || '' } }];
    if (values.dkcb) fields['852'] = [{ ind1: '#', ind2: '#', subfields: { a: 'Thư viện Đà Nẵng', b: values.shelf || 'Kho Mượn', j: values.dkcb } }];
    if (values.ddc) fields['082'] = [{ ind1: '0', ind2: '4', subfields: { '2': '23', a: values.ddc, b: cutterResult || '' } }];
    if (values.language) fields['041'] = [{ ind1: '0', ind2: '#', subfields: { a: values.language } }];
    if (values.subject) fields['650'] = [{ ind1: '#', ind2: '7', subfields: { a: values.subject, '2': 'TVQG' } }];
    if (values.pages) fields['300'] = [{ ind1: '#', ind2: '#', subfields: { a: `${values.pages} tr.`, c: values.size || '' } }];
    if (values.edition) fields['250'] = [{ ind1: '#', ind2: '#', subfields: { a: values.edition } }];
    if (values.series) fields['490'] = [{ ind1: '0', ind2: '#', subfields: { a: values.series } }];
    if (values.alternativeTitle) fields['246'] = [{ ind1: '1', ind2: '1', subfields: { a: values.alternativeTitle } }];
    if (values.summary) fields['520'] = [{ ind1: '#', ind2: '#', subfields: { a: values.summary } }];
    if (values.corporateAuthor) fields['610'] = [{ ind1: '1', ind2: '7', subfields: { a: values.corporateAuthor, '2': 'TVQG' } }];
    if (values.geographic) fields['651'] = [{ ind1: '#', ind2: '7', subfields: { a: values.geographic, '2': 'TVQG' } }];
    if (values.freeKeyword) fields['653'] = [{ ind1: '#', ind2: '#', subfields: { a: values.freeKeyword } }];
    if (values.addedAuthor) fields['700'] = [{ ind1: '1', ind2: '#', subfields: { a: values.addedAuthor, e: values.authorRole || '' } }];
    if (values.librarian) fields['910'] = [{ ind1: '#', ind2: '#', subfields: { b: values.librarian, d: new Date().toLocaleDateString('vi-VN') } }];
    return fields;
  };

  const handlePreview = () => {
    const values = form.getFieldsValue();
    const fields = buildFields(values);
    if (!fields['245']) return message.warning('Vui lòng nhập nhan đề trước');
    setPreviewData(fields);
    setPreviewVisible(true);
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const fields = buildFields(values);
      await apiClient.post('/cataloging/records', { fields });
      message.success('Đã lưu biểu ghi MARC21!');
      form.resetFields();
      setCutterResult(null);
      setDuplicateResult(null);
    } catch { message.error('Lỗi lưu biểu ghi'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <Card title="📝 Biên mục MARC21" extra={<Space><Button onClick={handlePreview} icon={<EyeOutlined />}>Xem trước</Button><Button type="primary" onClick={handleCheckDuplicate}>🔍 Tra trùng</Button></Space>}>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item name="title" label="📕 Nhan đề (245$a)" rules={[{ required: true }]}>
                    <Input placeholder="Văn hóa Việt Nam" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="author" label="✍️ Tác giả (100$a)">
                    <Input placeholder="Trần Quốc Vượng" suffix={<Button type="text" size="small" icon={<ThunderboltOutlined />} onClick={handleGenerateCutter} />} />
                  </Form.Item>
                </Col>
              </Row>

              {cutterResult && <Tag color="purple" style={{ marginBottom: 12 }}>✂️ Cutter: {cutterResult}</Tag>}

              {duplicateResult?.matches?.length > 0 && (
                <div style={{ background: '#fffbe6', padding: 8, borderRadius: 6, marginBottom: 12 }}>
                  <Typography.Text strong>⚠️ Biểu ghi trùng:</Typography.Text>
                  {duplicateResult.matches.map((m: any) => (
                    <div key={m.id} style={{ fontSize: 13, padding: '2px 0' }}>📄 {m.title} — {m.authorMain} ({m.publish_year})</div>
                  ))}
                </div>
              )}

              <Row gutter={12}>
                <Col span={8}><Form.Item name="publisher" label="Nhà XB (260$b)"><Input placeholder="NXB Văn hóa" /></Form.Item></Col>
                <Col span={4}><Form.Item name="year" label="Năm (260$c)"><Input placeholder="2023" /></Form.Item></Col>
                <Col span={6}><Form.Item name="isbn" label="ISBN (020$a)"><Input placeholder="9786047767298" /></Form.Item></Col>
                <Col span={6}><Form.Item name="language" label="Ngôn ngữ (041$a)" initialValue="vie">
                  <Select options={[{ value: 'vie', label: 'Tiếng Việt' }, { value: 'eng', label: 'English' }, { value: 'fre', label: 'Français' }, { value: 'chi', label: '中文' }, { value: 'jpn', label: '日本語' }, { value: 'kor', label: '한국어' }]} />
                </Form.Item></Col>
              </Row>

              <Row gutter={12}>
                <Col span={6}><Form.Item name="ddc" label="DDC (082$a)"><Input placeholder="332.6324" /></Form.Item></Col>
                <Col span={6}><Form.Item name="subject" label="Chủ đề (650$a)"><Input placeholder="Văn hóa" /></Form.Item></Col>
                <Col span={6}><Form.Item name="dkcb" label="ĐKCB (852$j)" rules={[{ required: true }]}><Input placeholder="M.102568" /></Form.Item></Col>
                <Col span={6}><Form.Item name="shelf" label="Kho (852$b)" initialValue="Kho Mượn">
                  <Select options={[{ value: 'Kho Mượn', label: 'Kho Mượn' }, { value: 'Kho Đọc', label: 'Kho Đọc' }, { value: 'Kho Thiếu nhi', label: 'Kho Thiếu nhi' }, { value: 'Kho Người lớn', label: 'Kho Người lớn' }]} />
                </Form.Item></Col>
              </Row>

              <Row gutter={12}>
                <Col span={6}><Form.Item name="edition" label="Lần XB (250$a)"><Input placeholder="Tái bản lần 5" /></Form.Item></Col>
                <Col span={6}><Form.Item name="series" label="Tùng thư (490$a)"><Input placeholder="Tủ sách VH" /></Form.Item></Col>
                <Col span={6}><Form.Item name="alternativeTitle" label="ND song ngữ (246$a)"><Input placeholder="English title" /></Form.Item></Col>
                <Col span={6}><Form.Item name="price" label="Giá (020$c)"><Input placeholder="169000" /></Form.Item></Col>
              </Row>

              <Row gutter={12}>
                <Col span={12}><Form.Item name="pages" label="Số trang (300$a)"><Input placeholder="456" /></Form.Item></Col>
                <Col span={6}><Form.Item name="size" label="Khổ (300$c)"><Input placeholder="24 cm" /></Form.Item></Col>
                <Col span={6}><Form.Item name="copiesCount" label="Số bản (020$d)"><Input placeholder="1000" /></Form.Item></Col>
              </Row>

              <Row gutter={12}>
                <Col span={12}><Form.Item name="corporateAuthor" label="Tổ chức (610$a)"><Input placeholder="UNESCO" /></Form.Item></Col>
                <Col span={12}><Form.Item name="geographic" label="Địa danh (651$a)"><Input placeholder="Đà Nẵng" /></Form.Item></Col>
              </Row>

              <Row gutter={12}>
                <Col span={12}><Form.Item name="freeKeyword" label="TK tự do (653$a)"><Input placeholder="Đĩa bay" /></Form.Item></Col>
                <Col span={12}>
                  <Form.Item name="addedAuthor" label="TG phụ (700$a)">
                    <Select mode="tags" placeholder="Nguyễn Thừa Hỷ" onSearch={handleSearchAuthor} options={authors} notFoundContent={null} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="summary" label="Tóm tắt (520$a)"><Input.TextArea rows={2} placeholder="Tóm tắt nội dung..." /></Form.Item>

              <Form.Item name="librarian" label="Người/Ngày (910$b)">
                <Input placeholder="Tiến" />
              </Form.Item>

              <Button type="primary" htmlType="submit" block size="large" loading={loading} icon={<BookOutlined />}>💾 Lưu biểu ghi MARC21</Button>
            </Form>
          </Card>
        </Col>
      </Row>

      <Modal title="👁️ Xem trước biểu ghi MARC21" open={previewVisible} onCancel={() => setPreviewVisible(false)} footer={<Button onClick={() => setPreviewVisible(false)}>Đóng</Button>} width={600}>
        {previewData && Object.entries(previewData).map(([tag, fields]: [string, any]) => (
          <div key={tag} style={{ fontFamily: 'Consolas, monospace', fontSize: 13, padding: '3px 0' }}>
            <span style={{ color: '#e74c3c', fontWeight: 700 }}>= {tag}</span>{'  '}
            {fields[0]?.ind1 !== '#' ? fields[0]?.ind1 : ' '}{fields[0]?.ind2 !== '#' ? fields[0]?.ind2 : ' '}{'  '}
            {Object.entries(fields[0]?.subfields || {}).map(([code, val]: [string, any]) => (
              <span key={code}> <span style={{ color: '#27ae60' }}>${code}</span>{val}</span>
            ))}
          </div>
        ))}
      </Modal>
    </div>
  );
};

export default CatalogingPage;
