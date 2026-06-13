import React, { useState } from 'react';
import { Input, AutoComplete, Segmented } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getSuggestions } from '@yongin/api';
import { useDebounce } from '../../hooks';

export const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<string>('all');
  const [options, setOptions] = useState<{ value: string }[]>([]);
  const navigate = useNavigate();
  const debouncedQuery = useDebounce(query, 300);

  React.useEffect(() => {
    if (debouncedQuery.length >= 2) {
      getSuggestions(debouncedQuery).then((s) => {
        setOptions(s.slice(0, 6).map((item) => ({ value: item.text })));
      });
    } else {
      setOptions([]);
    }
  }, [debouncedQuery]);

  const handleSearch = (value: string) => {
    if (value.trim()) navigate(`/search?q=${encodeURIComponent(value)}&type=${type}`);
  };

  return (
    <div style={{ textAlign: 'center', marginBottom: 24 }}>
      <Segmented
        value={type}
        onChange={(val) => setType(val as string)}
        options={[
          { value: 'all', label: '📖 Toàn bộ' },
          { value: 'author', label: '✍️ Tác giả' },
          { value: 'title', label: '📕 Nhan đề' },
          { value: 'subject', label: '🏷️ Chủ đề' },
        ]}
        style={{ marginBottom: 12 }}
      />
      <AutoComplete
        options={options}
        onSelect={(val) => handleSearch(val)}
        style={{ width: '100%', maxWidth: 600 }}
      >
        <Input.Search
          size="large"
          placeholder="🔍 Tìm kiếm tài liệu..."
          enterButton
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onSearch={handleSearch}
        />
      </AutoComplete>
    </div>
  );
};
