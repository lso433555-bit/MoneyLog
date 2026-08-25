import { createClient } from "@/lib/supabase/server";
import { LoginRequired } from "@/components/ui/LoginRequired";
import { RecurringView } from "@/components/recurring/RecurringView";
import type { RecurringTemplateItem } from "@/types/recurring";
import type { CategoryOption } from "@/lib/categories";

interface TemplateRow {
  id: string;
  type: "income" | "expense";
  name: string;
  amount: number;
  day_of_month: number;
  is_active: boolean;
  category: CategoryOption | null;
}

export default async function RecurringPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <LoginRequired />;
  }

  const [templatesRes, categoriesRes] = await Promise.all([
    supabase
      .from("recurring_templates")
      .select("id, type, name, amount, day_of_month, is_active, category:categories(id, name, icon, color)")
      .order("day_of_month", { ascending: true })
      .returns<TemplateRow[]>(),
    supabase.from("categories").select("id, name, icon, color").order("sort_order").returns<CategoryOption[]>(),
  ]);

  const templates: RecurringTemplateItem[] = (templatesRes.data ?? []).map((t) => ({
    id: t.id,
    type: t.type,
    name: t.name,
    amount: t.amount,
    dayOfMonth: t.day_of_month,
    isActive: t.is_active,
    category: t.category,
  }));

  return <RecurringView initialTemplates={templates} categories={categoriesRes.data ?? []} />;
}
