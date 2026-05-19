# Soothe MVP Build Spec v1

**Product:** Soothe  
**Version:** MVP Build Spec v1  
**Platform:** Expo iOS + Android  
**Stack:** Expo + Supabase + PostHog + n8n + OpenAI  
**Primary market:** Global / English  
**Primary user:** Busy parents with children aged 0–10  
**Core promise:** Make family life feel lighter.  
**Core message:** You don’t have to remember everything.

---

## 1. Product summary

Soothe is a calm AI family assistant for busy parents.

It helps parents turn scattered family thoughts, reminders, appointments, school tasks, errands, and mental load into a simple weekly family plan.

The first MVP focuses on one core behavior:

> A parent tells Soothe what is happening this week. Soothe turns it into a calm family plan organized as **Today / This Week / Later**.

The product should feel less like a productivity app and more like a gentle family support system.

Soothe should help users:

- remember family tasks,
- organize the week,
- share the load with a partner,
- avoid mental overload,
- keep everything in one calm place.

---

## 2. MVP positioning

### One-line positioning

**Soothe helps busy parents turn family chaos into a calm weekly plan.**

### Welcome hero

**Make family life feel lighter.**  
*A calm AI assistant for busy parents — plan the week, remember the small things, and share the load together.*

CTA:

**Continue with Google**

Trust line:

**No pressure, no clutter — just a calmer week.**

---

## 3. MVP scope

### In scope

The MVP includes:

1. Google sign-in
2. First onboarding
3. Family Space creation
4. Optional child setup
5. Home screen
6. Plan screen
7. Weekly AI plan generation
8. AI task extraction from text
9. Task cards
10. Add / edit / delete / complete tasks
11. Today / This Week / Later organization
12. Drag and drop task movement
13. Partner email invite
14. Partner accept flow
15. Shared task behavior
16. Push notifications
17. Reminder system
18. Soothe Plus fake-door
19. PostHog analytics
20. n8n AI workflows

### Out of scope for MVP

Do **not** build these in MVP:

- WhatsApp import
- PDF/photo/email-to-task
- Calendar integration
- Full chat memory
- Complex AI coaching
- Multi-family support UI
- More than owner + partner in product UI
- Real payment system
- Stripe integration
- In-app subscriptions
- File storage for child documents
- Health records
- Medical advice
- Complex permissions
- Audit log
- Family chat
- Comments on tasks
- Voice input
- Referral tracking system
- Full multi-language support
- Web app

---

## 4. Core user flow

### First-time user flow

1. User opens app.
2. Sees Welcome screen.
3. Continues with Google.
4. App creates profile.
5. App creates Family Space.
6. User sees child onboarding.
7. User can add child name + age or skip.
8. User sees transition screen.
9. User is invited to create first family plan.
10. User enters weekly planning flow.
11. Soothe asks 3 questions.
12. AI generates task cards.
13. User reviews generated cards.
14. User removes unnecessary cards.
15. User taps **This looks good**.
16. Tasks are added to Family Plan.
17. Success screen appears.
18. User can view Family Plan or Split the load.
19. Push permission prompt appears after first value moment.

---

## 5. Main navigation

Bottom nav:

```txt
Home / Plan / + / Family / Settings
```

### Center + button

Tapping the center **+** opens an action sheet:

1. **Add task**
2. **Ask Soothe**
3. **Create weekly plan**

Behavior:

- **Add task** opens manual task creation.
- **Ask Soothe** navigates to Home and focuses the AI input.
- **Create weekly plan** opens full-screen weekly planning flow.

---

## 6. Screen map

MVP screens:

1. Welcome / Sign in with Google
2. First onboarding: child name + age
3. First plan transition screen
4. Home
5. Plan
6. Create weekly plan flow
7. Review generated tasks
8. Plan success screen
9. Task detail bottom sheet
10. Add task flow
11. Family
12. Invite partner flow
13. Partner accept onboarding
14. Settings
15. Soothe Plus fake-door
16. Plus feedback screen

---

# 7. Screen details

---

## 7.1 Welcome / Sign in

### Main copy

**Soothe**

**Make family life feel lighter.**  
*A calm AI assistant for busy parents — plan the week, remember the small things, and share the load together.*

CTA:

**Continue with Google**

Trust line:

**No pressure, no clutter — just a calmer week.**

### Behavior

- Uses Supabase Auth with Google provider.
- After sign-in:
  - create or fetch profile,
  - create default Family Space if none exists,
  - route to onboarding if not completed.

---

## 7.2 First onboarding: child setup

### Title

**Let’s start with one little person.**

### Subtitle

**Add one child for now. You can add more later.**

### Fields

- Child’s name
- Age

### CTA

**Continue**

### Secondary action

**Skip for now**

### Behavior

- User can skip child setup.
- If skipped, no Home warning should appear.
- Child data can be added later from Family screen.

---

## 7.3 First plan transition screen

### Title

**Tell Soothe what’s on your mind this week.**

### Subtitle

**A few thoughts are enough. Soothe will turn them into a calmer family plan.**

### CTA

**Create my first family plan**

### Secondary

**Go to Home**

### Behavior

- Primary CTA opens weekly plan flow.
- Secondary CTA routes to Home.

---

## 7.4 Home screen

Home is the calm entry point and AI assistant surface.

### Header

**A little lighter today.**

### Relief metric

Example:

**3 things off your mind this week**

This is calculated from completed tasks in current active weekly plan.

### Status line

**Here’s what matters today.**

### Home content

Show:

- Today’s important tasks
- Assigned-to-you tasks
- Unassigned tasks if relevant
- AI input
- Quick prompt chips

### AI input

Placeholder:

**Ask Soothe to plan, remember, or split something…**

Prompt chips:

- **Remember this**
- **Plan something**
- **Share a task**

### AI input behavior

The input looks conversational but has limited MVP scope.

Supported intents:

1. Add task from text
2. Create task suggestions from text
3. Create weekly plan from text
4. Split/share a task

Example user input:

> We have a doctor visit on Thursday and I need to remember the insurance card.

Soothe should produce an inline suggestion card:

```txt
Suggested task

Bring insurance card
Thursday · Ada · Unassigned

Add to plan / Edit / Dismiss
```

For multiple tasks, show inline list:

```txt
Suggested tasks

Attend school meeting — Wednesday · Ada · Unassigned
Prepare swimming bag — Friday · Ada · Unassigned
Buy birthday gift — This week · No child · Unassigned

Add all / Dismiss
```

No long chat response in MVP.

---

## 7.5 Plan screen

### Header

**Family Plan**

### Subtitle

**The little things, gently organized.**

### Sections

- Today
- This Week
- Later

### Empty state

Title:

**Tell Soothe what’s happening this week.**

Subtitle:

**A few thoughts are enough — Soothe will turn them into a calmer family plan.**

Input placeholder:

**School, appointments, payments, errands, anything on your mind…**

CTA:

**Create my family plan**

### Behavior

- Plan screen shows active weekly plan tasks.
- Done tasks are hidden by default.
- Completed tasks can be shown via **Show completed**.
- Tasks can be dragged within and across sections.
- Drag behavior is defined in task behavior section.

---

## 7.6 Create weekly plan flow

Full-screen 3-step calm onboarding flow.

Each step uses:

- heading,
- helper text,
- free text input,
- quick chips.

Chip behavior:

- Tapping a chip inserts the chip text into the input.
- No complex follow-up in MVP.

---

### Step 1

Title:

**What’s coming up for your family this week?**

Subtitle:

**School, work, appointments, activities, errands — whatever is taking up space in your mind.**

Placeholder:

**Luca has swimming Friday, I need to pay school lunch, and we have a doctor visit…**

Quick chips:

- School
- Doctor
- Activities
- Payments
- Errands

---

### Step 2

Title:

**What’s been sitting in your head?**

Subtitle:

**The small things you don’t want to forget — forms, payments, calls, bags, gifts, documents.**

Placeholder:

**School form, birthday gift, call the doctor, bring the insurance card…**

Quick chips:

- Forms
- Payments
- Documents
- Calls
- Bags
- Gifts

---

### Step 3

Title:

**Who’s holding the week together right now?**

Subtitle:

**No judgment — this just helps Soothe understand how to make the plan feel fair and realistic.**

Placeholder:

**Mostly me, but I’d like my partner to help with pickups and reminders…**

Quick chips:

- Mostly me
- Mostly partner
- Shared
- Not sure

---

### Generate button

**Turn this into a calmer plan**

### Loading screen

**Making space in your mind…**

Subtitle:

**Turning the little things into a calmer family plan.**

---

## 7.7 Review generated tasks

After AI generation, show task cards before adding them to the real plan.

### Title

**Here’s what Soothe found for your week.**

### Subtitle

**Review the little things before they’re added to your family plan.**

### Sections

- Today
- This Week
- Later

### Card action

**Not needed**

This removes the generated task from review. No confirmation needed because it is not yet added to plan.

### Main CTA

**This looks good**

### Behavior

- User cannot edit tasks on review screen.
- User can remove unnecessary tasks.
- User taps **This looks good**.
- Remaining tasks are inserted into `tasks`.
- Weekly plan status becomes `active`.

---

## 7.8 Success screen

### Title

**That’s off your mind now.**

### Subtitle

**Come back anytime to add, remember, or share the load.**

### Summary

Example:

```txt
5 things added
2 for today
1 waiting to be assigned
```

### CTAs

Primary:

**View Family Plan**

Secondary:

**Split the load**

### After success

Show push permission preparation card:

**A little help remembering?**  
*Soothe can send gentle reminders for the family tasks that matter — no noise, no clutter.*

CTA:

**Allow gentle reminders**

Secondary:

**Maybe later**

If permission denied:

**No problem — you can turn reminders on later.**

---

# 8. Task system

---

## 8.1 Task card display

Task cards show:

- title
- time label
- child or No child
- assignee
- status
- New badge if applicable

Example:

```txt
Confirm school form
Tomorrow · Ada · You
To do
```

Example partner task:

```txt
Pick up Ada’s medicine
Thursday · Ada · Martina
To do
```

Example unassigned:

```txt
Buy birthday gift
This week · No child · Unassigned
To do
```

### Assignee UI

Use calm avatar/initial + label.

Rules:

- Current user shown as **You**
- Partner shown by display name
- Shared shown as **Shared**
- Unassigned shown as **Unassigned**
- Pending partner shown as **Pending partner**
- Shared pending shown as **Shared pending**

Do not store “me” in DB. Store family-role-based assignee.

---

## 8.2 Task status

Statuses:

```txt
todo
done
overdue
```

UI labels:

- To do
- Done
- Overdue

Done tasks are hidden by default and shown under **Show completed**.

---

## 8.3 Completing tasks

Task card interaction:

- Tap card → opens task detail bottom sheet
- Swipe right → mark Done
- Toast appears:

**Done — one less thing to carry.**

Toast includes:

**Undo**

No left swipe in MVP.

---

## 8.4 Completed tasks

Plan screen should hide completed tasks by default.

At bottom:

**Show completed**

When opened:

```txt
Completed this week
- Confirm school form
- Buy birthday gift
- Pay lunch fee
```

Completed tasks can be viewed and marked back as to-do.

Action:

**Mark as to do**

No full editing for completed tasks in MVP.

---

## 8.5 Task detail bottom sheet

Task details open as bottom sheet, not separate screen.

Editable fields:

- Task title
- When
- Child
- Assignee
- Reminder

Read/display fields:

- Status
- Why? if AI-generated

### Main CTA behavior

If no fields changed:

**Mark as done**

If any field changed:

**Save changes**

### Delete behavior

Delete is inside three-dot menu.

Menu:

**Delete task**

Confirmation:

**Delete task?**  
*This will remove it from your family plan.*

Buttons:

**Cancel**  
**Delete**

---

## 8.6 Why explanation

Only AI-generated tasks show **Why?**

Example:

**Why?**  
*Suggested because you mentioned a school-related task this week.*

This should be collapsible or secondary, not visible as large text on the card.

---

## 8.7 Manual Add Task

Manual task fields:

- Task title
- When
- Child
- Assignee
- Reminder

Default values:

- Child: No child
- Assignee: Unassigned
- Reminder: None
- Status: To do
- Source: manual

---

# 9. Date, time and reminder logic

---

## 9.1 When field

Options:

1. No date
2. Today
3. Tomorrow
4. This Week
5. Later
6. Pick a date

### Rules

- No date → no `due_at`, reminder disabled
- Today → date set to today, reminder available
- Tomorrow → date set to tomorrow, reminder available
- This Week → no exact date unless user picks day
- Later → no exact date unless user picks date
- Pick a date → exact date, reminder available

### This Week behavior

If user selects **This Week**, show optional link:

**Pick a day**

Day options:

- Mon
- Tue
- Wed
- Thu
- Fri
- Weekend

If user picks day, reminder becomes available.

### Later behavior

If user selects **Later**, show optional link:

**Pick a date**

If no date, reminder disabled.

---

## 9.2 Time field

Time options:

1. No specific time
2. Morning
3. Afternoon
4. Evening
5. Custom time

Internal approximate times:

```txt
Morning   → 09:00
Afternoon → 14:00
Evening   → 18:00
```

These are used internally for `due_at`, but UI displays friendly labels.

Examples:

- Tomorrow morning
- Friday afternoon
- Tonight
- Friday, 17:30

---

## 9.3 Reminder options

Reminder options:

```txt
none
30_min_before
1_hour_before
morning_of
1_day_before
```

### Reminder activation rules

Reminder disabled if:

- no date,
- This Week without picked day,
- Later without picked date.

Reminder enabled if:

- Today,
- Tomorrow,
- picked date,
- custom date/time.

### 30 min / 1 hour rule

30 min and 1 hour reminders are available **only when user selected Custom time**.

If time is Morning / Afternoon / Evening, only show:

- None
- Morning of
- 1 day before

### Morning of

Send at:

```txt
08:00 local family time
```

### 1 day before

Send at:

```txt
Previous day at 18:00 local family time
```

This applies even if task has custom time.

### 30 min / 1 hour

Send relative to custom task time.

Notification title:

**In 30 minutes**  
or  
**In 1 hour**

Body:

Task title with child context if available.

Example:

**In 30 minutes**  
*Bring Ada’s insurance card.*

---

# 10. Drag and drop behavior

Tasks can be reordered with drag and drop.

### Same section drag

If user drags within the same section:

- update `sort_order`,
- no confirmation needed.

### Cross-section drag

Tasks can move across:

- Today
- This Week
- Later

If task has no date:

- move directly,
- update `section`.

If task has date:

Show confirmation bottom sheet:

**Move this task?**  
*This task already has a date. What should Soothe do?*

Options:

**Keep date**  
Move to new section but keep date.

**Update date**  
Move to new section and update date according to selected section.

Rules:

- Move to Today + Update date → due date becomes today
- Move to This Week + Update date → due date removed unless user picks day
- Move to Later + Update date → due date removed unless user picks date

---

# 11. Partner / split the load

---

## 11.1 Split the load entry

Success screen secondary CTA:

**Split the load**

Flow starts with explanation, then email invite.

### First explanation

**Share the load, gently**  
*Soothe can help you share this plan with your partner. Nothing overwhelming — just a calmer way to stay on the same page.*

Then:

**Invite your partner**  
*They’ll be able to see the family plan, take tasks, and help keep the week lighter.*

Input:

**Partner email**

CTA:

**Send invite**

---

## 11.2 Partner invite email

Subject:

**Let’s make the week feel lighter together**

Body:

```txt
Hi,

You’ve been invited to join your family plan on Soothe.

Soothe helps busy parents turn family tasks, reminders, appointments, and little things to remember into a calmer weekly plan.

You’ll be able to see what’s coming up, help with tasks, and keep the week feeling lighter together.

Join the family plan:

[Accept invite]
```

---

## 11.3 Partner accept flow

First screen:

**You’re joining the [Family Name] family plan**  
*Sign in to help make the week feel lighter together.*

CTA:

**Continue with Google**

After Google login, show mini onboarding.

### Notification preference

**How much should Soothe notify you?**

Options:

**Essential**  
Only important task reminders and direct assignments.

**Balanced**  
Task reminders, direct assignments, and gentle family-plan nudges.  
Default.

**Detailed**  
More updates about shared tasks and family plan changes.

### Contribution preference

**How do you want to help with the plan?**

Options:

- I’ll take tasks assigned to me
- I’ll pick tasks from the plan
- I’ll help review the week together

CTA:

**Go to Family Plan**

---

## 11.4 Partner first Family Plan experience

Top section:

**Here’s where you can help**  
*Pick a task, take something off the mental load, or check what’s coming up.*

Cards:

```txt
Assigned to you
2 tasks

Unassigned tasks
3 tasks waiting

Coming up today
1 thing needs attention
```

Then show normal Family Plan.

---

## 11.5 Assignee logic

DB must not store “me”. Use family role.

Suggested enum:

```txt
owner
partner
pending_partner
shared
shared_pending
unassigned
```

UI maps based on current user.

### Before partner invited

Assignee options:

- You
- Partner — Invite first
- Unassigned

If user taps Partner — Invite first, open invite partner flow.

### Invite sent but not accepted

Assignee options:

- You
- Pending partner
- Shared pending
- Unassigned

### Partner joined

Assignee options:

- You
- Partner display name
- Shared
- Unassigned

---

## 11.6 Pending partner tasks

If partner invite is sent but not accepted, user can assign tasks to:

**Pending partner**

Task card:

```txt
Pick up Ada’s medicine
Thursday · Ada · Pending partner
```

No assigned task push is sent until partner accepts.

---

## 11.7 Partner accepts pending tasks

When partner accepts invite and pending tasks exist, show:

**These tasks were waiting for you**  
*Your partner added a few tasks that may need your help. You can accept them all or review them first.*

Buttons:

**Accept all**  
**Review first**

### Accept all

All pending partner tasks become assigned to partner.

### Review first

Each task shows actions:

**I can take this**  
Task becomes partner-assigned.

**Make it shared**  
Task becomes shared.

**Leave for later**  
Task becomes unassigned.

If partner taps **Leave for later**, send gentle notification to other parent:

**Still waiting to be assigned**  
*Pick up Ada’s medicine is still open.*

If partner taps **Make it shared**, send positive notification:

**Shared task added**  
*Pick up Ada’s medicine is now shared in your family plan.*

---

# 12. Shared tasks

Shared tasks require both parents to mark their part done.

Card example:

```txt
Prepare weekend trip
Saturday · No child · Shared
0/2 done
```

Button:

**I’ve done my part**

States:

```txt
0/2 done
1/2 done — Halfway there.
2/2 done — Done
```

When one parent marks their part:

- set `shared_owner_done_at` or `shared_partner_done_at`,
- show `1/2 done`,
- notify the other parent gently.

Notification:

**One part is done**  
*“Prepare weekend trip” is halfway lighter.*

When both complete:

- set task status to `done`,
- show toast:

**Done — one less thing to carry.**

Send positive notification:

**Shared task completed**  
*“Prepare weekend trip” is off your family’s mind.*

---

## 12.1 Shared pending

If partner has not joined yet, task can be:

**Shared pending**

Card:

```txt
Prepare weekend trip
Saturday · No child · Shared pending
```

Owner can still tap:

**I’ve done my part**

Then show:

```txt
1/2 ready
Waiting for your partner to join.
```

When partner joins, task becomes real shared task and progress continues:

```txt
1/2 done
Halfway there.
```

---

# 13. Family screen

Family screen is not a settings dump. It manages family structure.

### Sections

## Children

Each child:

- Name
- Age
- School / daycare
- Activities
- Edit
- Remove

Child profile fields:

```txt
name
age
school_name
activities
```

First onboarding only asks:

```txt
name
age
```

School and activities are added later from Family screen.

## Partner

Partner invite status:

- Not invited yet
- Invite sent
- Joined

CTA:

**Invite partner**

## Family members

Show:

- You
- Partner, if joined

---

# 14. Settings

Settings sections:

1. Account
2. Notifications
3. Weekly Reset
4. Soothe Plus

---

## 14.1 Account

Fields:

- Display name
- Avatar

Avatar rules:

- Google avatar comes automatically.
- If no avatar, show initials.
- User can choose **Use initials instead**.
- No image upload in MVP.

User’s own name behavior:

- Task cards show **You**
- Detail/profile can show real name

Partner name behavior:

- Comes from Google full name
- Editable from Settings / Profile
- Task cards show partner display name

---

## 14.2 Notifications

Title:

**Reminder style**

Options:

**Essential**  
Only important task reminders and direct assignments.

**Balanced**  
Task reminders, direct assignments, and gentle family-plan nudges.  
Default.

**Detailed**  
More updates about shared tasks and family plan changes.

If notification permission disabled and user tries to set reminder:

**Reminders are off right now.**  
*Turn on notifications to get gentle reminders for this task.*

CTA:

**Open notification settings**

---

## 14.3 Weekly Reset

Default:

```txt
Sunday, 18:00
```

User can change:

- day
- time

Weekly reset push only goes to users/families who do not have an active plan for that week.

Message:

**Ready to make this week feel lighter?**  
*Plan your family week in 3 minutes.*

---

## 14.4 Soothe Plus

Settings shows a small Plus area:

**Soothe Plus**  
*Create a new calm family plan every week.*  
**$6.99/month — Coming soon**

This is not the main fake-door. Main fake-door appears when user tries to create second weekly plan.

---

# 15. Soothe Plus fake-door

Pricing signal:

```txt
Soothe Plus — $6.99/month
```

### Trigger

User gets first AI weekly plan free.

When user attempts to create a second weekly plan, show Plus fake-door.

### Fake-door screen

Title:

**Soothe Plus is almost ready**

Body:

**We’re building weekly planning carefully, so it stays calm, useful, and never overwhelming.**

Feature list:

- Create a new calm family plan every week
- Keep shared tasks organized with your partner
- Use more family templates as your needs grow

Button:

**I’m interested**

Small text:

**No payment today.**

---

## 15.1 After I’m interested

Show:

**Thanks — you’re on the early list**  
*We’ll use your interest to shape Soothe Plus carefully.*

Then mini feedback:

**What would make Plus valuable for you?**

Multi-select:

- Weekly AI family plans
- Partner task sharing
- More family templates
- PDF/photo to tasks
- Smarter reminders
- Something else

Other field:

**Anything else you’d pay for?**

Then optional share:

**Know another parent who might need this?**  
**Share Soothe**

Share message:

```txt
I’m trying Soothe — a calm AI family assistant for busy parents.

It helps turn family chaos, reminders, appointments, school tasks, and little things to remember into a simple weekly plan.

You can try it for free here:
[link]
```

---

# 16. Notifications

All push orchestration in MVP is handled through n8n.

Notification types:

1. Weekly reset push
2. Assigned task push
3. Deadline reminder push
4. Shared task update push
5. Shared task completed push
6. Pending partner review outcome push

---

## 16.1 Weekly reset push

Sent by n8n.

Rules:

- Check `profiles.weekly_reset_day`
- Check `profiles.weekly_reset_time`
- Use family/user timezone
- Check no active weekly plan exists for current week
- Check `last_weekly_reset_push_sent_week` not current week
- Send push
- Update sent fields

Payload:

```txt
Ready to make this week feel lighter?
Plan your family week in 3 minutes.
```

---

## 16.2 Assigned task push

Send immediately when one user assigns a task to another real joined user.

Do not send when:

- partner accepts task themselves,
- user marks task done,
- task is edited,
- task moves section,
- partner is still pending.

Push:

**A small task was added for you**  
*Pick up Ada’s medicine — Thursday*

Push click behavior:

- opens Plan screen,
- opens task bottom sheet,
- highlights card lightly after bottom sheet closes.

---

## 16.3 New badge

Assigned tasks show **New** badge.

Rules:

- New badge appears when task assigned to user.
- It disappears when user opens task detail.
- If never opened, it expires after 24 hours.

DB fields:

```txt
new_for_user_id
new_badge_expires_at
seen_by_assignee_at
```

---

## 16.4 Reminder push

n8n reminder workflow runs every 15 minutes.

It checks:

- task status = todo
- `due_at` exists
- reminder_type != none
- reminder time reached
- same reminder has not already been sent

After sending, update:

```txt
reminder_sent_at
reminder_sent_for_due_at
reminder_sent_for_type
```

If user changes `due_at` or `reminder_type`, reset those reminder sent fields.

---

# 17. PostHog analytics

Use PostHog for funnel, retention, and fake-door measurement.

Core events:

```txt
signup_completed
child_added
weekly_plan_started
weekly_plan_created
tasks_added_to_plan
task_created_manual
task_completed
partner_invite_sent
partner_joined_family
second_weekly_plan_attempted
plus_fake_door_viewed
plus_interested_clicked
plus_feedback_submitted
```

Additional useful events:

```txt
ai_input_submitted
ai_tasks_suggested
ai_suggestions_added
ai_suggestions_dismissed
task_swiped_done
task_undo_clicked
task_deleted
task_assigned
shared_task_part_done
shared_task_completed
push_permission_requested
push_permission_allowed
push_permission_denied
weekly_reset_push_sent
deadline_reminder_sent
```

### Main success metric

**Weekly Repeat Intent**

Definition:

User attempts to create a second weekly plan after first free plan.

Event:

```txt
second_weekly_plan_attempted
```

Success threshold:

```txt
50 target users → at least 10 second weekly plan attempts
```

### Monetization signal

```txt
50 target users → at least 5 plus_interested_clicked
```

---

# 18. Technical architecture

## Stack

```txt
Expo
Supabase
PostHog
n8n
OpenAI
Expo Push API
```

### Expo

Responsible for:

- mobile app UI,
- Google auth flow through Supabase,
- storing session,
- push token registration,
- rendering screens,
- calling Supabase,
- calling n8n endpoints,
- receiving push notifications.

### Supabase

Responsible for:

- auth,
- profiles,
- family data,
- children,
- plans,
- tasks,
- invites,
- push tokens,
- row-level security.

### n8n

Responsible for:

- weekly plan AI generation,
- AI input → task extraction,
- scheduled reminders,
- weekly reset push,
- assigned task push if implemented server-side,
- Expo Push API calls.

### OpenAI

Responsible for:

- converting user weekly planning answers into structured task JSON,
- converting free text into one or more task suggestions.

### PostHog

Responsible for:

- product analytics,
- funnel tracking,
- retention tracking,
- fake-door behavior,
- session replay if enabled.

---

# 19. Supabase schema

Use UUID primary keys.

Enable RLS on all user data tables.

---

## 19.1 profiles

```sql
profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,

  email text,
  full_name text,
  display_name text,
  avatar_url text,
  use_initials_avatar boolean default false,

  notification_level text default 'balanced',
  weekly_reset_day text default 'sunday',
  weekly_reset_time time default '18:00',
  auto_add_suggestions boolean default false,

  onboarding_completed boolean default false,
  current_family_id uuid,

  last_weekly_reset_push_sent_week text,
  last_weekly_reset_push_sent_at timestamptz,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
)
```

Allowed `notification_level`:

```txt
essential
balanced
detailed
```

---

## 19.2 families

```sql
families (
  id uuid primary key default gen_random_uuid(),

  name text,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  partner_user_id uuid references auth.users(id) on delete set null,

  partner_invite_status text default 'not_invited',

  default_timezone text default 'UTC',
  default_locale text default 'en',

  created_at timestamptz default now(),
  updated_at timestamptz default now()
)
```

Allowed `partner_invite_status`:

```txt
not_invited
invited
joined
```

---

## 19.3 children

```sql
children (
  id uuid primary key default gen_random_uuid(),

  family_id uuid not null references families(id) on delete cascade,

  name text not null,
  age int,
  school_name text,
  activities text[],

  created_by uuid references auth.users(id) on delete set null,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
)
```

---

## 19.4 weekly_plans

```sql
weekly_plans (
  id uuid primary key default gen_random_uuid(),

  family_id uuid not null references families(id) on delete cascade,

  week_start date not null,
  summary text,
  status text default 'draft',

  generated_by_user_id uuid references auth.users(id) on delete set null,
  source text default 'ai',

  raw_ai_input jsonb,
  raw_ai_output jsonb,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
)
```

Allowed `status`:

```txt
draft
active
archived
```

Allowed `source`:

```txt
ai
manual
```

---

## 19.5 tasks

```sql
tasks (
  id uuid primary key default gen_random_uuid(),

  family_id uuid not null references families(id) on delete cascade,
  weekly_plan_id uuid references weekly_plans(id) on delete set null,
  child_id uuid references children(id) on delete set null,

  title text not null,

  section text not null default 'this_week',
  sort_order int default 0,

  time_label text,
  due_at timestamptz,
  time_precision text default 'none',

  assignee_role text default 'unassigned',
  status text default 'todo',

  reminder_type text default 'none',

  source text default 'manual',
  why text,

  shared_owner_done_at timestamptz,
  shared_partner_done_at timestamptz,

  new_for_user_id uuid references auth.users(id) on delete set null,
  new_badge_expires_at timestamptz,
  seen_by_assignee_at timestamptz,

  reminder_sent_at timestamptz,
  reminder_sent_for_due_at timestamptz,
  reminder_sent_for_type text,

  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  completed_by uuid references auth.users(id) on delete set null,
  completed_at timestamptz,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
)
```

Allowed `section`:

```txt
today
this_week
later
```

Allowed `time_precision`:

```txt
none
date_only
time_period
custom_time
```

Allowed `assignee_role`:

```txt
owner
partner
pending_partner
shared
shared_pending
unassigned
```

Allowed `status`:

```txt
todo
done
overdue
```

Allowed `reminder_type`:

```txt
none
30_min_before
1_hour_before
morning_of
1_day_before
```

Allowed `source`:

```txt
ai
manual
```

---

## 19.6 family_invites

```sql
family_invites (
  id uuid primary key default gen_random_uuid(),

  family_id uuid not null references families(id) on delete cascade,

  invited_email text not null,
  status text default 'pending',

  invited_by uuid references auth.users(id) on delete set null,
  accepted_by uuid references auth.users(id) on delete set null,

  token text not null unique,
  expires_at timestamptz,

  created_at timestamptz default now(),
  accepted_at timestamptz
)
```

Allowed `status`:

```txt
pending
accepted
expired
revoked
```

Default expiry:

```txt
now() + interval '7 days'
```

---

## 19.7 push_tokens

```sql
push_tokens (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references auth.users(id) on delete cascade,
  family_id uuid references families(id) on delete cascade,

  expo_push_token text not null,
  platform text,
  device_id text,

  is_active boolean default true,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
)
```

Allowed `platform`:

```txt
ios
android
```

---

# 20. RLS rules

Use RLS from the start.

High-level rules:

## profiles

Users can:

- read own profile,
- update own profile.

## families

Users can read/update family if:

- they are `owner_user_id`, or
- they are `partner_user_id`.

## children

Users can read/write children if they belong to a family where user is owner or partner.

## weekly_plans

Users can read/write plans if they belong to a family where user is owner or partner.

## tasks

Users can read/write tasks if they belong to a family where user is owner or partner.

## family_invites

Owner can create invite for own family.

Invited user can accept invite if:

- token is valid,
- invite not expired,
- invited email matches authenticated email.

## push_tokens

Users can manage only their own push tokens.

---

# 21. AI workflow contracts

---

## 21.1 n8n workflow: Weekly Plan Generation

Endpoint:

```txt
POST /ai/weekly-plan
```

Input:

```json
{
  "request_id": "uuid",
  "user_id": "uuid",
  "family_id": "uuid",
  "timezone": "Europe/Rome",
  "today_iso": "2026-05-17",
  "week_start": "2026-05-18",
  "children": [
    {
      "id": "uuid",
      "name": "Ada",
      "age": 6,
      "school_name": "Palermo Primary School",
      "activities": ["Swimming", "Piano"]
    }
  ],
  "answers": {
    "coming_up": "School meeting Wednesday, swimming Friday...",
    "sitting_in_head": "Lunch fee, insurance card, birthday gift...",
    "load_context": "Mostly me, partner can help with pickups."
  }
}
```

Output:

```json
{
  "request_id": "uuid",
  "summary": "Here’s a calm plan for your family week.",
  "sections": {
    "today": [
      {
        "title": "Confirm school form",
        "section": "today",
        "time_label": "Today",
        "due_at": "2026-05-17T09:00:00+02:00",
        "time_precision": "date_only",
        "child_id": "uuid-or-null",
        "child_name": "Ada",
        "assignee_role": "unassigned",
        "reminder_type": "none",
        "source": "ai",
        "why": "Suggested because you mentioned a school-related task this week."
      }
    ],
    "this_week": [],
    "later": []
  },
  "warnings": []
}
```

Rules:

- Return valid JSON only.
- No markdown.
- No prose outside JSON.
- Do not invent medical/legal advice.
- Do not assign tasks to partner automatically.
- Default assignee is `unassigned`.
- Use `child_id` only if matched confidently.
- Use `child_id: null` for No child.
- Use Today / This Week / Later.
- Keep tasks short and actionable.
- Avoid overwhelming number of tasks.
- Prefer 3–8 useful tasks.

---

## 21.2 n8n workflow: AI Input Task Extraction

Endpoint:

```txt
POST /ai/extract-tasks
```

Input:

```json
{
  "request_id": "uuid",
  "user_id": "uuid",
  "family_id": "uuid",
  "timezone": "Europe/Rome",
  "today_iso": "2026-05-17",
  "children": [
    {
      "id": "uuid",
      "name": "Ada",
      "age": 6
    }
  ],
  "input_text": "We have a doctor visit on Thursday and I need to remember the insurance card."
}
```

Output:

```json
{
  "request_id": "uuid",
  "summary": "I found one thing to add.",
  "suggested_tasks": [
    {
      "title": "Bring insurance card",
      "section": "this_week",
      "time_label": "Thursday",
      "due_at": "2026-05-21T09:00:00+02:00",
      "time_precision": "date_only",
      "child_id": "uuid-or-null",
      "child_name": "Ada",
      "assignee_role": "unassigned",
      "reminder_type": "none",
      "source": "ai",
      "why": "Suggested because you mentioned a doctor visit this week."
    }
  ],
  "warnings": []
}
```

Rules:

- If input contains one task, return one task.
- If input contains multiple tasks, return multiple tasks.
- If ambiguous, keep title broad but useful.
- Do not ask follow-up in MVP unless input is unusable.
- Do not auto-add unless frontend setting `auto_add_suggestions` is enabled.
- Default user setting is auto-add off.

---

# 22. n8n scheduled workflows

---

## 22.1 Reminder workflow

Schedule:

```txt
Every 15 minutes
```

Steps:

1. Query tasks where:
   - status = todo
   - due_at is not null
   - reminder_type != none
2. Calculate reminder target time.
3. Check target time <= now.
4. Check same reminder was not sent:
   - `reminder_sent_for_due_at != due_at` or null
   - `reminder_sent_for_type != reminder_type` or null
5. Fetch relevant push tokens.
6. Send Expo push.
7. Update:
   - reminder_sent_at
   - reminder_sent_for_due_at
   - reminder_sent_for_type

---

## 22.2 Weekly reset workflow

Schedule:

```txt
Every 15 minutes or hourly
```

Steps:

1. Query profiles with weekly reset settings.
2. Convert current time to family/user timezone.
3. Check day/time match.
4. Check current week code.
5. Check no active weekly plan exists for that week.
6. Check weekly reset push not already sent this week.
7. Send push.
8. Update:
   - last_weekly_reset_push_sent_week
   - last_weekly_reset_push_sent_at

---

## 22.3 Assigned task push workflow

This can be triggered from app after assignment update or by n8n webhook.

Send push only when:

- task assigned from one joined user to another joined user,
- assignee_role becomes owner or partner,
- assigned user is not current user.

Do not send when:

- assignee is pending_partner,
- assignee is shared_pending,
- user assigns task to themselves,
- task is only edited,
- task is completed.

---

# 23. Push click behavior

For task-related pushes:

1. Open app.
2. Navigate to Plan screen.
3. Open related task bottom sheet.
4. After bottom sheet closes, lightly highlight the task card for 2–3 seconds.

For weekly reset push:

1. Open app.
2. If no active plan for week, open Create weekly plan flow.
3. If active plan exists due to state change, open Plan screen.

---

# 24. Build milestones

---

## Milestone 1 — App foundation

Build:

- Expo app setup
- Supabase client
- Google auth
- basic navigation
- PostHog setup
- theme tokens
- Welcome screen

Done when:

- user can sign in with Google,
- profile is created,
- user lands in app.

---

## Milestone 2 — Core data model

Build:

- Supabase tables
- RLS policies
- profile creation
- family creation
- child onboarding
- Family screen
- Settings skeleton

Done when:

- user has profile,
- family space,
- optional child,
- can view/edit family basics.

---

## Milestone 3 — Plan and tasks

Build:

- Plan screen
- Today / This Week / Later sections
- task cards
- task bottom sheet
- add task
- edit task
- delete task
- mark done
- undo
- show completed
- task sorting

Done when:

- user can manage tasks manually.

---

## Milestone 4 — AI weekly plan

Build:

- Create weekly plan flow
- n8n weekly plan endpoint
- OpenAI prompt
- JSON validation
- Review generated tasks
- Remove generated cards
- This looks good → insert tasks
- Success screen

Done when:

- user can create first AI family plan.

---

## Milestone 5 — Home AI input

Build:

- Home AI input
- prompt chips
- n8n task extraction endpoint
- inline suggestion cards
- Add to plan
- Add all
- Dismiss

Done when:

- free text becomes task suggestions.

---

## Milestone 6 — Partner invite and collaboration

Build:

- invite partner flow
- family_invites table handling
- invite email
- accept invite token
- partner onboarding
- pending partner tasks
- shared tasks
- shared pending tasks
- I’ve done my part

Done when:

- partner can join Family Space and collaborate.

---

## Milestone 7 — Push notifications

Build:

- Expo push token registration
- push_tokens table
- push permission prompt after first plan
- n8n reminder workflow
- weekly reset workflow
- assigned task push
- push deep linking

Done when:

- reminders and weekly reset push work.

---

## Milestone 8 — Plus fake-door and analytics

Build:

- second weekly plan attempt detection
- Plus fake-door
- I’m interested event
- Plus feedback screen
- share message
- PostHog event tracking
- core funnel dashboard

Done when:

- monetization signal is measurable.

---

# 25. 30-day validation plan

## Target

Recruit 50 target users.

Primary target:

```txt
Busy parents with children aged 0–10
```

## Success threshold

Main:

```txt
50 users → at least 10 second weekly plan attempts
```

Secondary:

```txt
50 users → at least 5 plus_interested_clicked
```

Activation:

```txt
50 users → at least 25 first weekly plans created
```

Collaboration:

```txt
Track partner_invite_sent and partner_joined_family
```

## User acquisition sequence

Week 1:

- 10 parent interviews
- internal test users
- working Expo flow

Week 2:

- 20 target users
- organic Instagram/TikTok content
- improve onboarding based on friction

Week 3:

- small landing/reel/Meta/TikTok test
- 20 more users
- measure first plan completion

Week 4:

- observe second-week behavior
- measure Plus clicks
- decide continue / pivot / narrow segment

---

# 26. Interview script

Use with first 10 parents.

Opening:

```txt
Hey, I’m testing a small idea for busy parents.

It’s about the mental load of family life: remembering school things, appointments, tasks, reminders, and all the small stuff that often lives in one parent’s head.

I’m not trying to sell anything right now. I’m just talking to a few parents to understand if this is a real problem and whether a calm AI family assistant could actually help.

Would you be open to a quick 15-minute chat this week?
```

Problem question:

```txt
In the last 2 weeks, when did family organization feel stressful or mentally heavy?
```

Follow-ups:

```txt
What happened?
Who remembered it?
Who usually carries that in their head?
What happens if it gets forgotten?
How do you manage this today?
```

Demo framing:

```txt
Soothe is a calm AI family assistant for busy parents.

Every Sunday evening, it asks: “Want to plan the week in 3 minutes?”

You write what’s happening, what you’re worried about forgetting, and how the load is usually shared.

Then Soothe turns that into a simple Today / This Week / Later family plan.

You can add tasks, set reminders, and invite your partner to share the load.
```

Validation questions:

```txt
Would you use this in real life?
What feels most useful?
What feels unnecessary?
Would this become a weekly habit?
What would make this valuable enough to pay for?
```

---

# 27. Design direction

Visual direction:

**Minimal but warm.**

Do:

- warm cream/off-white background,
- soft cards,
- calm typography,
- subtle pastels,
- gentle rounded corners,
- low-pressure microcopy,
- minimal dashboard density.

Avoid:

- harsh productivity UI,
- gamified streaks,
- aggressive red alerts,
- dense tables,
- too many charts,
- corporate SaaS feeling.

Product feeling:

```txt
Less dashboard.
More relief.
```

---

# 28. Core copy reference

## Global

**Make family life feel lighter.**

**You don’t have to remember everything.**

**Plan, remember, and share the load.**

## Home

**A little lighter today.**

**Here’s what matters today.**

**Ask Soothe to plan, remember, or split something…**

**Remember this**  
**Plan something**  
**Share a task**

## Plan

**Family Plan**

**The little things, gently organized.**

**Tell Soothe what’s happening this week.**

**Create my family plan**

## Weekly planning

**What’s coming up for your family this week?**

**What’s been sitting in your head?**

**Who’s holding the week together right now?**

**Turn this into a calmer plan**

**Making space in your mind…**

**Here’s what Soothe found for your week.**

**This looks good**

**That’s off your mind now.**

## Task

**Done — one less thing to carry.**

**I’ve done my part**

**Halfway there.**

**Not needed**

## Push permission

**A little help remembering?**

**Allow gentle reminders**

**Maybe later**

**No problem — you can turn reminders on later.**

## Partner

**Let’s make the week feel lighter together.**

**Share the load, gently**

**Here’s where you can help**

**I can take this**

**Make it shared**

**Leave for later**

---

# 29. Codex implementation instruction

Use this as the master instruction for Codex:

```txt
Build Soothe MVP as an Expo mobile app using Supabase, PostHog, n8n webhooks, and OpenAI-powered workflows.

Do not build beyond MVP scope.

Prioritize:
1. Working user flow
2. Clean data model
3. Calm UX
4. Accurate task behavior
5. Measurable analytics

Do not implement:
- payments
- document upload
- calendar integration
- WhatsApp import
- full chat assistant
- multi-member family permissions
- complex AI memory
- web app

Implement in milestones:
1. Auth + onboarding
2. Supabase schema + RLS
3. Plan/tasks UI
4. Weekly AI plan generation
5. Home AI input task extraction
6. Partner invite/shared tasks
7. Push notifications
8. Plus fake-door/PostHog

Use the exact product copy and behavior rules defined in this spec.
```

---

## Final MVP definition

The MVP is successful when a busy parent can:

1. sign in,
2. create a Family Space,
3. optionally add a child,
4. tell Soothe what is happening this week,
5. receive a calm AI-generated family plan,
6. manage tasks in Today / This Week / Later,
7. invite a partner,
8. share or complete family tasks,
9. receive gentle reminders,
10. return the next week to create another plan.

The product should not feel like another task manager.

It should feel like:

> “I don’t have to keep all of this in my head anymore.”
