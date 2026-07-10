# Shidduch Workflow — Sequence Diagrams

מקור אמת: `backEnd/src/match-cases/constants/shidduch-workflow.ts`

---

## 1. בקשת משודך (Person A שולח לשדכן)

```mermaid
sequenceDiagram
    participant A as Person A (sender)
    participant S as Shadchan
    participant B as Person B (receiver)

    A->>S: שליחת פרופיל לשדכן
    Note over A,S: status=sent_to_shadchan<br/>waitingFor=shadchan<br/>A approved profile on create
    Note over B: לא רואה תיק

    S->>S: קדם ל"ממתין לצד השני"
    Note over A,B: status=waiting_for_other_side<br/>waitingFor=receiver
    Note over B: עכשיו רואה הצעה

    B->>B: מעוניין/ת (אישור פרופיל)
    Note over A,B: waitingFor=shadchan<br/>שניהם אישרו פרופיל

    S->>S: קדם ל"בדיקת רקע"
    Note over A,B: status=background_check<br/>waitingFor=both

    A->>A: צפייה בפרטי קשר + מעוניין/ת
    B->>B: צפייה בפרטי קשר + מעוניין/ת
    Note over A,B: waitingFor=shadchan<br/>שניהם אישרו אחרי BG

    S->>S: קדם ל"אישור פגישה"
    Note over A,B: status=waiting_for_meeting_approval<br/>waitingFor=both

    A->>A: מעוניין/ת בפגישה
    B->>B: מעוניין/ת בפגישה
    Note over A,B: waitingFor=shadchan

    S->>S: קדם ל"פגישה נקבעה"
    Note over A,B: status=meeting_scheduled

    S->>S: קדם ל"אחרי פגישה"
    Note over A,B: status=waiting_after_meeting<br/>waitingFor=both

    A->>A: מעוניין/ת להמשיך
    B->>B: מעוניין/ת להמשיך

    S->>S: קדם ל"הותאם"
    Note over A,B: status=matched
```

---

## 2. הצעת שדכן (shadchan-push)

```mermaid
sequenceDiagram
    participant S as Shadchan
    participant A as Person A
    participant B as Person B

    S->>A: יצירת תיק + שליחה
    S->>B: יצירת תיק + שליחה
    Note over A,B: status=sent_to_shadchan<br/>waitingFor=both<br/>tag=shadchan-push
    Note over A,B: שניהם רואים "הצעה מהשדכן"

    A->>A: מעוניין/ת
    B->>B: מעוניין/ת
    Note over A,B: profile approvals complete<br/>waitingFor=shadchan

    S->>S: קדם ל"ממתין לצד השני"
    Note over A,B: ממשיך כמו בזרימה הרגילה...

    S->>S: קדם ל"בדיקת רקע"
    Note over A,B: contact details + BG approvals

    Note over S: המשך זהה לזרימה 1 משלב background_check
```

---

## 3. דחייה (כל שלב פעיל)

```mermaid
sequenceDiagram
    participant P as Person A / B / Shadchan
    participant Case as Case

    P->>Case: דחייה (+ סיבה)
    Case->>Case: status=denied
    Note over Case: closedAt set<br/>history: Denied
```

---

## 4. מפת waitingFor

| waitingFor | משמעות | מי רואה "התור שלך" |
|------------|---------|---------------------|
| sender | Person A | Person A |
| receiver | Person B | Person B |
| both | שניהם | Person A + Person B |
| shadchan | השדכן | Shadchan (קדם לשלב הבא) |
| null | אין תור (למשל meeting_scheduled) | — |

---

## קבצים קשורים

- [shidduch-status-pipeline.csv](./shidduch-status-pipeline.csv) — מעברי שלבים
- [shidduch-stage-permissions.csv](./shidduch-stage-permissions.csv) — מטריצת הרשאות לפי שלב
