export interface CallData {
  success: boolean;
  data: {
    id: string;
    company: string;
    fiscal_year: string;
    quarter: string | null;
    call_date: string;
    transcript_url: string | null;
    transcript_text: string | null;
    ppt_url: string;
    ppt_text: string;
    created_at: string;
    updated_at: string;
    basic_industry: string | null;
    company_name: string | null;
    quarterly_result: string | null;
    quarterly_result_url: string | null;
    quarterly_result_text: string | null;
  };
}
