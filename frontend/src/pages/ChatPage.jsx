import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import ChatBox from "../components/ChatBox";
import InsightCard from "../components/InsightCard";
import DatasetOverview from "../components/DatasetOverview";
import ColumnList from "../components/ColumnList";
import Card, { CardHeader } from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { ChatIcon, FileIcon } from "../components/ui/Icons";

export default function ChatPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const sessionData = location.state?.sessionData;
  const [columnSearch, setColumnSearch] = useState("");

  useEffect(() => {
    if (!sessionData) navigate("/");
  }, [sessionData, navigate]);

  if (!sessionData) return null;

  const { session_id, file_name, summary, insights } = sessionData;

  return (
    <DashboardLayout
      title={file_name}
      subtitle={`${summary.row_count.toLocaleString()} rows · ${summary.col_count} columns`}
      sessionId={session_id}
      searchValue={columnSearch}
      onSearchChange={setColumnSearch}
    >
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <section className="animate-fade-in-up">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge variant="success">Active Session</Badge>
            <Badge variant="muted">
              <FileIcon className="w-3 h-3 inline mr-1" />
              {file_name.split(".").pop()?.toUpperCase()}
            </Badge>
          </div>
          <DatasetOverview summary={summary} />
        </section>

        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <ColumnList columns={summary.columns} search={columnSearch} />
            {insights?.length > 0 && <InsightCard insights={insights} />}
          </div>

          <div className="lg:col-span-8">
            <Card padding className="h-[calc(100vh-280px)] min-h-[560px] flex flex-col animate-fade-in-up stagger-2">
              <CardHeader
                title="AI Chat"
                subtitle="Ask questions about your dataset"
                icon={ChatIcon}
                action={
                  <button
                    onClick={() => navigate("/")}
                    className="btn-ghost text-xs"
                  >
                    New upload
                  </button>
                }
              />
              <div className="flex-1 min-h-0">
                <ChatBox sessionId={session_id} />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
