"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Plus, Users, Calendar, User, CalendarCheck, Briefcase, X } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type TimeSlot = string;

type Member = {
  id: string;
  name: string;
  color: string;
  availability: TimeSlot[];
  priority: TimeSlot[];
};

type Meeting = {
  id: string;
  title: string;
  slot: TimeSlot;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS = ["週一", "週二", "週三", "週四", "週五"];
const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17];
const COLORS = [
  "bg-orange-500", "bg-pink-500", "bg-teal-500",
  "bg-indigo-500", "bg-red-500", "bg-yellow-500", "bg-cyan-500",
];

const slot = (day: number, hour: number): TimeSlot => `${day}-${hour}`;

// ─── Fake initial data ────────────────────────────────────────────────────────

const INITIAL_MEMBERS: Member[] = [
  {
    id: "me",
    name: "我",
    color: "bg-blue-500",
    availability: [
      slot(0, 9), slot(0, 10), slot(0, 11),
      slot(0, 14), slot(0, 15), slot(0, 16),
      slot(2, 9),  slot(2, 10), slot(2, 11),
      slot(3, 14), slot(3, 15), slot(3, 16),
      slot(4, 9),  slot(4, 10),
    ],
    priority: [slot(2, 9), slot(2, 10)],
  },
  {
    id: "xiao-liang",
    name: "小梁",
    color: "bg-green-500",
    availability: [
      slot(0, 9),  slot(0, 10), slot(0, 11),
      slot(2, 9),  slot(2, 10), slot(2, 11),
      slot(2, 14), slot(2, 15), slot(2, 16),
      slot(4, 9),  slot(4, 10),
    ],
    priority: [slot(2, 9), slot(2, 10), slot(2, 11), slot(0, 9), slot(0, 10)],
  },
  {
    id: "lu-lu",
    name: "盧盧",
    color: "bg-purple-500",
    availability: [
      slot(0, 9),  slot(0, 10),
      slot(1, 10), slot(1, 11), slot(1, 12),
      slot(2, 9),  slot(2, 10), slot(2, 11),
      slot(3, 14), slot(3, 15),
      slot(4, 9),  slot(4, 10),
    ],
    priority: [slot(2, 9), slot(2, 10), slot(2, 11), slot(3, 14), slot(0, 9), slot(4, 9)],
  },
];

// ─── Schedule Grid Component ──────────────────────────────────────────────────

function ScheduleGrid({
  availability,
  onToggle,
  emerald = false,
  meetingOnly = false,
}: {
  availability: TimeSlot[];
  onToggle?: (day: number, hour: number) => void;
  emerald?: boolean;
  meetingOnly?: boolean;
}) {
  return (
    <div className="overflow-x-auto select-none">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className="w-14" />
            {DAYS.map((d) => (
              <th key={d} className="p-2 text-center font-medium text-sm">{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {HOURS.map((h, hi) => (
            <tr key={h}>
              <td className="text-right pr-3 text-muted-foreground text-xs py-0.5 whitespace-nowrap">
                {h}:00
              </td>
              {DAYS.map((_, d) => {
                const s = slot(d, h);
                const active = availability.includes(s);
                const cellClass = active
                  ? emerald
                    ? "bg-emerald-400 border-emerald-400"
                    : "bg-primary border-primary";
                } else {
                  cellClass = "bg-muted border-border hover:bg-muted/60";
                }

                return (
                  <td key={d} className="p-0.5">
                    <div
                      className={`h-8 rounded border transition-colors ${cellClass} ${onToggle ? "cursor-pointer" : "cursor-default"}`}
                      onClick={() => onToggle?.(d, h)}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Legend ───────────────────────────────────────────────────────────────────

function Legend({ items }: { items: { color: string; label: string }[] }) {
  return (
    <div className="flex flex-wrap gap-4 mb-5 text-xs text-muted-foreground">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <div className={`w-3 h-3 rounded ${item.color}`} />
          {item.label}
        </div>
      ))}
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

function ConfirmDialog({
  open, onOpenChange, title, description,
  confirmLabel = "確認", cancelLabel = "取消",
  onConfirm, destructive = false,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  destructive?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        {description && (
          <p className="text-sm text-muted-foreground -mt-1">{description}</p>
        )}
        <div className="flex gap-2 mt-2">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button
            className={`flex-1 ${destructive ? "bg-destructive hover:bg-destructive/90 text-white" : ""}`}
            onClick={() => { onConfirm(); onOpenChange(false); }}
          >
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function MeetFlow() {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [newName, setNewName] = useState("");
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [viewId, setViewId] = useState("xiao-liang");
  const [fillMode, setFillMode] = useState<"normal" | "priority">("normal");

  // Booking flow
  const [bookingSlot, setBookingSlot] = useState<TimeSlot | null>(null);
  const [meetingTitle, setMeetingTitle] = useState("");
  const [bookingInputOpen, setBookingInputOpen] = useState(false);
  const [bookingConfirmOpen, setBookingConfirmOpen] = useState(false);

  // Cancel flow
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);

  const me = members.find((m) => m.id === "me")!;
  const others = members.filter((m) => m.id !== "me");
  const viewing = members.find((m) => m.id === viewId) ?? others[0];

  const bookedSlots = meetings.map((m) => m.slot);
  const meetingMap: Record<TimeSlot, string> = {};
  meetings.forEach((m) => { meetingMap[m.slot] = m.title; });

  const commonSlots = DAYS.flatMap((_, d) =>
    HOURS.filter((h) =>
      members.every((m) =>
        m.availability.includes(slot(d, h)) || m.priority.includes(slot(d, h))
      )
    ).map((h) => slot(d, h))
  );

  function toggleMySlot(day: number, hour: number) {
    const s = slot(day, hour);
    setMembers((prev) =>
      prev.map((m) =>
        m.id !== "me"
          ? m
          : {
              ...m,
              availability: m.availability.includes(s)
                ? m.availability.filter((x) => x !== s)
                : [...m.availability, s],
            }
      )
    );
  }

  function addMember() {
    const name = newName.trim();
    if (!name) return;
    const color = COLORS[members.length % COLORS.length];
    setMembers((prev) => [
      ...prev,
      { id: `member-${Date.now()}`, name, color, availability: [], priority: [] },
    ]);
    setNewName("");
    setMemberDialogOpen(false);
  }

  function openBooking(s: TimeSlot) {
    setBookingSlot(s);
    setMeetingTitle("");
    setBookingInputOpen(true);
  }

  function proceedToConfirm() {
    if (!meetingTitle.trim()) return;
    setBookingInputOpen(false);
    setBookingConfirmOpen(true);
  }

  function confirmBooking() {
    if (!bookingSlot || !meetingTitle.trim()) return;
    setMeetings((prev) => [
      ...prev,
      { id: `meeting-${Date.now()}`, title: meetingTitle.trim(), slot: bookingSlot },
    ]);
    setBookingSlot(null);
    setMeetingTitle("");
  }

  function requestCancel(id: string) {
    setCancelTargetId(id);
    setCancelConfirmOpen(true);
  }

  function confirmCancel() {
    if (!cancelTargetId) return;
    setMeetings((prev) => prev.filter((m) => m.id !== cancelTargetId));
    setCancelTargetId(null);
  }

  const cancelTarget = meetings.find((m) => m.id === cancelTargetId);

  const slotLabel = (s: TimeSlot) => {
    const [d, h] = s.split("-").map(Number);
    return `${DAYS[d]} ${h}:00–${h + 1}:00`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <CalendarCheck className="w-5 h-5" />
          <h1 className="text-lg font-semibold tracking-tight">MeetFlow</h1>
          <Badge variant="secondary" className="text-xs font-normal">Beta</Badge>
        </div>
      </header>

      {/* ── Booking: input title ── */}
      <Dialog open={bookingInputOpen} onOpenChange={setBookingInputOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader><DialogTitle>敲定會議</DialogTitle></DialogHeader>
          {bookingSlot && (
            <p className="text-sm text-muted-foreground -mt-1">{slotLabel(bookingSlot)}</p>
          )}
          <div className="flex flex-col gap-3 mt-1">
            <Input
              placeholder="輸入會議名稱"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && proceedToConfirm()}
              autoFocus
            />
            <Button onClick={proceedToConfirm} disabled={!meetingTitle.trim()}>
              下一步
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Booking: confirm ── */}
      <ConfirmDialog
        open={bookingConfirmOpen}
        onOpenChange={setBookingConfirmOpen}
        title="確認敲定會議？"
        description={bookingSlot ? `「${meetingTitle}」— ${slotLabel(bookingSlot)}` : undefined}
        confirmLabel="敲定"
        onConfirm={confirmBooking}
      />

      {/* ── Cancel confirm ── */}
      <ConfirmDialog
        open={cancelConfirmOpen}
        onOpenChange={setCancelConfirmOpen}
        title="確認取消會議？"
        description={
          cancelTarget ? `「${cancelTarget.title}」— ${slotLabel(cancelTarget.slot)}` : undefined
        }
        confirmLabel="取消會議"
        cancelLabel="保留"
        onConfirm={confirmCancel}
        destructive
      />

      {/* ── Main ── */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <Tabs defaultValue="members">
          <TabsList className="mb-8 h-10">
            <TabsTrigger value="members" className="gap-1.5 text-sm">
              <Users className="w-3.5 h-3.5" />成員
            </TabsTrigger>
            <TabsTrigger value="my-schedule" className="gap-1.5 text-sm">
              <User className="w-3.5 h-3.5" />我的時間表
            </TabsTrigger>
            <TabsTrigger value="view-member" className="gap-1.5 text-sm">
              <Calendar className="w-3.5 h-3.5" />查看成員
            </TabsTrigger>
            <TabsTrigger value="common" className="gap-1.5 text-sm">
              <CalendarCheck className="w-3.5 h-3.5" />共同空閒
            </TabsTrigger>
            <TabsTrigger value="my-meetings" className="gap-1.5 text-sm">
              <Briefcase className="w-3.5 h-3.5" />我的會議
              {meetings.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
                  {meetings.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ── Tab 1: Members ── */}
          <TabsContent value="members">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold">成員列表</h2>
                <p className="text-sm text-muted-foreground mt-0.5">共 {members.length} 位成員</p>
              </div>
              <Dialog open={memberDialogOpen} onOpenChange={setMemberDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1.5">
                    <Plus className="w-4 h-4" />加入成員
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xs">
                  <DialogHeader><DialogTitle>加入新成員</DialogTitle></DialogHeader>
                  <div className="flex flex-col gap-3 mt-2">
                    <Input
                      placeholder="輸入成員名稱"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addMember()}
                      autoFocus
                    />
                    <Button onClick={addMember} disabled={!newName.trim()}>確認加入</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {members.map((m) => (
                <Card key={m.id}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <Avatar className="w-10 h-10 shrink-0">
                      <AvatarFallback className={`${m.color} text-white text-sm font-semibold`}>
                        {m.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{m.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.availability.length + m.priority.length} 個空閒時段
                        {m.priority.length > 0 && (
                          <span className="text-amber-500 ml-1">（{m.priority.length} 個優先）</span>
                        )}
                      </p>
                    </div>
                    {m.id === "me" && (
                      <Badge variant="outline" className="text-xs shrink-0">你</Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ── Tab 2: My Schedule ── */}
          <TabsContent value="my-schedule">
            <div className="mb-5">
              <h2 className="text-base font-semibold">我的時間表</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                點擊格子來切換你的空閒時段
              </p>
            </div>
            <Card>
              <CardContent className="pt-6">
                <Legend items={[
                  { color: "bg-primary", label: "普通空閒" },
                  { color: "bg-amber-400", label: "優先空閒" },
                  { color: "bg-violet-400", label: "已排會議" },
                  { color: "bg-muted border border-border", label: "忙碌" },
                ]} />
                <ScheduleGrid
                  availability={me.availability}
                  onToggle={toggleMySlot}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab 3: View Member ── */}
          <TabsContent value="view-member">
            <div className="mb-5">
              <h2 className="text-base font-semibold">查看成員時間表</h2>
              <p className="text-sm text-muted-foreground mt-0.5">選擇成員來查看他們的空閒時段</p>
            </div>
            {others.length === 0 ? (
              <p className="text-muted-foreground text-sm py-12 text-center">
                尚無其他成員，請先在「成員」頁加入
              </p>
            ) : (
              <>
                <div className="flex flex-wrap gap-2 mb-5">
                  {others.map((m) => (
                    <Button
                      key={m.id}
                      variant={viewing?.id === m.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewId(m.id)}
                    >
                      {m.name}
                    </Button>
                  ))}
                </div>
                {viewing && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base font-semibold">
                        <Avatar className="w-7 h-7">
                          <AvatarFallback className={`${viewing.color} text-white text-xs font-semibold`}>
                            {viewing.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        {viewing.name} 的時間表
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Legend items={[
                        { color: "bg-primary", label: "普通空閒" },
                        { color: "bg-amber-400", label: "優先空閒" },
                        { color: "bg-violet-400", label: "已排會議" },
                        { color: "bg-muted border border-border", label: "忙碌" },
                      ]} />
                      <ScheduleGrid
                        availability={viewing.availability}
                        priority={viewing.priority}
                        bookedSlots={bookedSlots}
                        meetingMap={meetingMap}
                      />
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          {/* ── Tab 4: Common Availability ── */}
          <TabsContent value="common">
            <div className="mb-5">
              <h2 className="text-base font-semibold">共同空閒時間</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                所有 {members.length} 位成員都空閒的時段，依優先人數排序
              </p>
            </div>
            <Card>
              <CardContent className="pt-6">
                <Legend items={[
                  { color: "bg-sky-400", label: "最佳時段" },
                  { color: "bg-emerald-400", label: "共同空閒" },
                  { color: "bg-violet-400", label: "已排會議" },
                  { color: "bg-muted border border-border", label: "非共同" },
                ]} />
                {commonSlots.length === 0 ? (
                  <p className="text-center text-muted-foreground py-10 text-sm">
                    目前沒有共同空閒時段
                  </p>
                ) : (
                  <ScheduleGrid
                    availability={commonSlots}
                    bookedSlots={bookedSlots}
                    bestSlots={bestSlots}
                    meetingMap={meetingMap}
                    emerald
                  />
                )}
              </CardContent>
            </Card>

            {sortedCommonSlots.length > 0 && (
              <div className="mt-4 flex flex-col gap-2">
                {sortedCommonSlots.map((s) => {
                  const priorityCount = members.filter((m) => m.priority.includes(s)).length;
                  const isBooked = bookedSlots.includes(s);
                  const isBest = bestSlots.includes(s);
                  return (
                    <div
                      key={s}
                      className={`flex items-center justify-between px-4 py-2.5 rounded-lg border ${
                        isBest
                          ? "bg-sky-50 border-sky-200 dark:bg-sky-950 dark:border-sky-800"
                          : "bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {isBest && (
                          <span className="text-sky-500 text-xs font-semibold shrink-0">最佳</span>
                        )}
                        <span className={`text-sm shrink-0 ${isBest ? "text-sky-800 dark:text-sky-200 font-medium" : "text-emerald-800 dark:text-emerald-200"}`}>
                          {slotLabel(s)}
                        </span>
                        {priorityCount > 0 && (
                          <span className="text-amber-500 text-xs font-medium shrink-0">
                            {"★".repeat(priorityCount)} {priorityCount} 人優先
                          </span>
                        )}
                        {isBooked && (
                          <Badge variant="secondary" className="text-xs bg-violet-100 text-violet-700 border-violet-200 shrink-0">
                            {meetingMap[s]}
                          </Badge>
                        )}
                      </div>
                      {isBooked ? (
                        <span className="text-xs text-muted-foreground ml-3 shrink-0">已排定</span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className={`text-xs h-7 ml-3 shrink-0 ${
                            isBest
                              ? "border-sky-300 text-sky-700 hover:bg-sky-100"
                              : "border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                          }`}
                          onClick={() => openBooking(s)}
                        >
                          敲定
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ── Tab 5: My Meetings ── */}
          <TabsContent value="my-meetings">
            <div className="mb-5">
              <h2 className="text-base font-semibold">我的會議</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                已敲定的會議時段（紫色），hover 格子可查看會議名稱
              </p>
            </div>
            <Card className="mb-6">
              <CardContent className="pt-6">
                <Legend items={[
                  { color: "bg-violet-400", label: "已排會議" },
                  { color: "bg-muted border border-border", label: "空閒" },
                ]} />
                <ScheduleGrid
                  availability={[]}
                  bookedSlots={bookedSlots}
                  meetingMap={meetingMap}
                  meetingOnly
                />
              </CardContent>
            </Card>

            {meetings.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">
                尚未敲定任何會議，請在「共同空閒」頁面敲定時段
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {meetings
                  .slice()
                  .sort((a, b) => {
                    const [ad, ah] = a.slot.split("-").map(Number);
                    const [bd, bh] = b.slot.split("-").map(Number);
                    return ad !== bd ? ad - bd : ah - bh;
                  })
                  .map((meeting) => (
                    <div
                      key={meeting.id}
                      className="flex items-center justify-between px-4 py-3 rounded-lg bg-violet-50 border border-violet-200 dark:bg-violet-950 dark:border-violet-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-violet-400 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-violet-800 dark:text-violet-200">
                            {meeting.title}
                          </p>
                          <p className="text-xs text-violet-500">{slotLabel(meeting.slot)}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => requestCancel(meeting.id)}
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
