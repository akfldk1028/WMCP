'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

const NASDAQ_COMPANIES = [
  { ticker: 'AAPL', name: 'Apple', nameKr: '애플' },
  { ticker: 'MSFT', name: 'Microsoft', nameKr: '마이크로소프트' },
  { ticker: 'GOOGL', name: 'Alphabet (Google)', nameKr: '구글' },
  { ticker: 'AMZN', name: 'Amazon', nameKr: '아마존' },
  { ticker: 'NVDA', name: 'NVIDIA', nameKr: '엔비디아' },
  { ticker: 'META', name: 'Meta Platforms', nameKr: '메타' },
  { ticker: 'TSLA', name: 'Tesla', nameKr: '테슬라' },
  { ticker: 'NFLX', name: 'Netflix', nameKr: '넷플릭스' },
  { ticker: 'AMD', name: 'AMD', nameKr: 'AMD' },
  { ticker: 'INTC', name: 'Intel', nameKr: '인텔' },
  { ticker: 'CRM', name: 'Salesforce', nameKr: '세일즈포스' },
  { ticker: 'ADBE', name: 'Adobe', nameKr: '어도비' },
  { ticker: 'CSCO', name: 'Cisco', nameKr: '시스코' },
  { ticker: 'ORCL', name: 'Oracle', nameKr: '오라클' },
  { ticker: 'QCOM', name: 'Qualcomm', nameKr: '퀄컴' },
  { ticker: 'UBER', name: 'Uber', nameKr: '우버' },
  { ticker: 'ABNB', name: 'Airbnb', nameKr: '에어비앤비' },
  { ticker: 'PYPL', name: 'PayPal', nameKr: '페이팔' },
  { ticker: 'SQ', name: 'Block (Square)', nameKr: '블록' },
  { ticker: 'SHOP', name: 'Shopify', nameKr: '쇼피파이' },
];

const KR_COMPANIES = [
  { ticker: '005930', name: 'Samsung Electronics', nameKr: '삼성전자' },
  { ticker: '000660', name: 'SK Hynix', nameKr: 'SK하이닉스' },
  { ticker: '096770', name: 'SK Innovation', nameKr: 'SK이노베이션' },
  { ticker: '035420', name: 'NAVER', nameKr: '네이버' },
  { ticker: '035720', name: 'Kakao', nameKr: '카카오' },
  { ticker: '051910', name: 'LG Chem', nameKr: 'LG화학' },
  { ticker: '006400', name: 'Samsung SDI', nameKr: '삼성SDI' },
  { ticker: '003670', name: 'Posco Holdings', nameKr: '포스코홀딩스' },
  { ticker: '055550', name: 'Shinhan Financial', nameKr: '신한지주' },
  { ticker: '105560', name: 'KB Financial', nameKr: 'KB금융' },
];

interface CompanyInputProps {
  onSubmit: (companyName: string) => void;
  loading?: boolean;
}

export default function CompanyInput({ onSubmit, loading }: CompanyInputProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState('');

  function handleSelect(name: string) {
    setSelected(name);
    setOpen(false);
    if (!loading) onSubmit(name);
  }

  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <div className="flex items-center gap-3">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <Button
                variant="outline"
                size="lg"
                className="h-12 flex-1 justify-between px-4 text-base font-normal"
                disabled={loading}
              />
            }
          >
            {selected ? (
              <span className="truncate">{selected}</span>
            ) : (
              <span className="text-muted-foreground">회사 선택...</span>
            )}
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </PopoverTrigger>
          <PopoverContent className="w-[var(--anchor-width)] p-0" align="start">
            <Command>
              <CommandInput placeholder="회사명 또는 티커 검색..." />
              <CommandList>
                <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
                <CommandGroup heading="NASDAQ">
                  {NASDAQ_COMPANIES.map((c) => (
                    <CommandItem
                      key={c.ticker}
                      value={`${c.name} ${c.nameKr} ${c.ticker}`}
                      onSelect={() => handleSelect(c.name)}
                    >
                      <Check
                        className={cn(
                          'mr-2 size-4',
                          selected === c.name ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      <span className="mr-2 w-14 shrink-0 rounded bg-muted px-1.5 py-0.5 text-center font-mono text-xs">
                        {c.ticker}
                      </span>
                      <span className="flex-1 font-medium">{c.name}</span>
                      <span className="text-xs text-muted-foreground">{c.nameKr}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandGroup heading="KOSPI">
                  {KR_COMPANIES.map((c) => (
                    <CommandItem
                      key={c.ticker}
                      value={`${c.name} ${c.nameKr} ${c.ticker}`}
                      onSelect={() => handleSelect(c.name)}
                    >
                      <Check
                        className={cn(
                          'mr-2 size-4',
                          selected === c.name ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      <span className="mr-2 w-14 shrink-0 rounded bg-muted px-1.5 py-0.5 text-center font-mono text-xs">
                        {c.ticker}
                      </span>
                      <span className="flex-1 font-medium">{c.name}</span>
                      <span className="text-xs text-muted-foreground">{c.nameKr}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Button
          size="lg"
          className="h-12 gap-2 px-6"
          disabled={!selected || loading}
          onClick={() => selected && onSubmit(selected)}
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Search className="size-4" />
          )}
          {loading ? '분석 중...' : '분석'}
        </Button>
      </div>

      {/* Quick picks */}
      {!loading && (
        <div className="flex flex-wrap gap-2">
          {[
            { name: 'Apple', kr: '애플' },
            { name: 'NVIDIA', kr: '엔비디아' },
            { name: 'Tesla', kr: '테슬라' },
            { name: 'Samsung Electronics', kr: '삼성전자' },
            { name: 'SK Innovation', kr: 'SK이노베이션' },
          ].map((c) => (
            <Button
              key={c.name}
              variant="outline"
              size="sm"
              onClick={() => handleSelect(c.name)}
              className="text-xs"
            >
              {c.kr}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
