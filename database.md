# Database Design: Teoycodex

**สถานะ:** Proposed สำหรับ MVP foundation
**อ้างอิง:** `PRD.md` v0.2, `PRODUCT.md`, และ Supabase integration ปัจจุบัน
**ฐานข้อมูลเป้าหมาย:** Supabase Postgres + Supabase Auth
**วันที่:** 30 สิงหาคม 2026

## 1. ขอบเขตและข้อสรุปสำคัญ

เอกสารนี้ออกแบบฐานข้อมูลจาก requirement ที่ยืนยันแล้ว โดยไม่สมมติ domain ธุรกิจที่ยังไม่มีข้อมูล

สิ่งที่ออกแบบพร้อมนำไปพัฒนาได้:

- บัญชีผู้ใช้และโปรไฟล์ โดยใช้ `auth.users` ของ Supabase เป็นแหล่งข้อมูล identity หลัก
- RBAC แบบหนึ่งผู้ใช้ต่อหนึ่งบทบาท มีเพียง `admin` และ `user`
- การเปิด/ปิดบัญชีและประวัติผู้ดำเนินการ
- Audit log สำหรับการเปลี่ยน role, การลบข้อมูล, การเข้าถึงที่ถูกปฏิเสธ และเหตุการณ์สำคัญ
- System settings สำหรับค่าที่ไม่ใช่ secret
- Notification, สถานะการส่ง และ preference ของผู้รับ
- Product analytics สำหรับวัด activation, workflow completion, failure และ retention

สิ่งที่ยัง **ไม่ควรสร้างเป็นตารางจริง** จนกว่า Product owner จะยืนยัน:

- Primary business entity ของ Teoycodex
- Core workflow, ขั้นตอน, สถานะ และกฎเปลี่ยนสถานะ
- Reviewer/approval flow
- Organization, team, project หรือขอบเขตเจ้าของข้อมูล
- ช่องทาง notification ที่จะใช้จริง
- ข้อมูลส่วนบุคคล/ข้อมูลอ่อนไหวและระยะเวลาเก็บรักษาตามกฎหมาย

การแยกส่วนเช่นนี้ทำให้ทีมเริ่มระบบบัญชีและ Admin surface ได้ โดยไม่สร้าง schema สมมติที่ต้องรื้อเมื่อ domain ถูกยืนยัน

## 2. หลักการออกแบบ

1. **Auth identity มีแหล่งเดียว:** password, OAuth identity, session และ recovery token อยู่ใน Supabase Auth ไม่ทำตารางซ้ำใน `public` schema
2. **บังคับสิทธิ์ที่ฐานข้อมูล:** ทุกตารางที่ client เข้าถึงต้องเปิด Row Level Security (RLS); การซ่อนเมนูเป็นเพียง UX
3. **Least privilege:** ผู้ใช้ทั่วไปอ่าน/แก้เฉพาะข้อมูลของตน ส่วน Admin ทำงานผ่าน policy หรือ server-side function ที่กำหนดชัดเจน
4. **Audit แยกจาก analytics:** audit ใช้สืบสวนและ compliance; analytics ใช้วัดพฤติกรรมผลิตภัณฑ์และห้ามบันทึก payload ที่มี PII โดยไม่จำเป็น
5. **เวลาเป็น UTC:** เก็บทุกเวลาชนิด `timestamptz`; แสดงผลด้วย timezone ของผู้ใช้ โดยค่าเริ่มต้น `Asia/Bangkok`
6. **Soft disable ไม่เท่ากับ delete:** ปิดบัญชีด้วย status และระงับการสร้าง session; ลบจริงเฉพาะตามนโยบาย retention
7. **ไม่เก็บ secret ใน settings:** API key, service-role key และ credential ต้องอยู่ใน secret manager/environment variables
8. **ชื่อในฐานข้อมูลใช้ `snake_case`:** ค่า enum และ machine-readable event name ใช้ตัวพิมพ์เล็กเพื่อหลีกเลี่ยงปัญหา case sensitivity

## 3. ภาพรวมความสัมพันธ์

```mermaid
erDiagram
    AUTH_USERS ||--|| PROFILES : "has"
    AUTH_USERS ||--|| USER_ROLES : "assigned"
    AUTH_USERS o|--o{ USER_ROLES : "grants"
    AUTH_USERS o|--o{ AUDIT_LOGS : "acts in"
    AUTH_USERS ||--o{ NOTIFICATIONS : "receives"
    AUTH_USERS ||--o{ NOTIFICATION_PREFERENCES : "configures"
    AUTH_USERS o|--o{ PRODUCT_EVENTS : "generates"
    AUTH_USERS o|--o{ SYSTEM_SETTINGS : "updates"

    AUTH_USERS {
      uuid id PK
      text email
      timestamptz created_at
    }
    PROFILES {
      uuid id PK_FK
      text display_name
      account_status status
      text locale
      text timezone
      timestamptz deactivated_at
    }
    USER_ROLES {
      uuid user_id PK_FK
      app_role role
      uuid granted_by FK
      timestamptz granted_at
    }
    AUDIT_LOGS {
      bigint id PK
      timestamptz occurred_at
      uuid actor_user_id FK
      text action
      text resource_type
      text resource_id
      audit_result result
    }
    NOTIFICATIONS {
      uuid id PK
      uuid recipient_user_id FK
      text event_name
      notification_channel channel
      notification_status status
      timestamptz read_at
    }
    NOTIFICATION_PREFERENCES {
      uuid user_id PK_FK
      text event_name PK
      notification_channel channel PK
      boolean enabled
    }
    PRODUCT_EVENTS {
      bigint id PK
      timestamptz occurred_at
      uuid user_id FK
      text event_name
      jsonb properties
    }
    SYSTEM_SETTINGS {
      text key PK
      jsonb value
      uuid updated_by FK
    }
```

> `AUTH_USERS` ในแผนภาพหมายถึง `auth.users` ซึ่ง Supabase เป็นผู้ดูแล ตารางอื่นอยู่ใน `public` schema เว้นแต่จะระบุเป็นอย่างอื่น

## 4. Types และค่ามาตรฐาน

| Type | ค่าที่อนุญาต | เหตุผล |
| --- | --- | --- |
| `app_role` | `admin`, `user` | ตรงกับ RBAC 2 บทบาทใน PRD |
| `account_status` | `active`, `disabled`, `pending_deletion` | แยกบัญชีใช้งาน, ปิดใช้งาน และรอลบตาม retention |
| `audit_result` | `success`, `failure`, `denied` | รองรับทั้งการทำงานสำเร็จ ล้มเหลว และ permission denied |
| `notification_channel` | `in_app`, `email` | รองรับ in-app และ email ตาม PRD; เปิดใช้ email เมื่อยืนยัน provider |
| `notification_status` | `queued`, `sent`, `delivered`, `failed`, `cancelled` | ติดตาม lifecycle และ retry ได้ |

ควรใช้ Postgres enum เมื่อชุดค่านิ่งตาม MVP และเปลี่ยนผ่าน migration เท่านั้น ส่วน `action`, `event_name` และ `resource_type` ใช้ `text` พร้อม naming convention เพราะรายการเหตุการณ์มีแนวโน้มเพิ่มบ่อย

## 5. รายละเอียดตาราง

### 5.1 `auth.users` — Authentication identity

Supabase Auth เป็นเจ้าของตารางนี้ แอปอ่านผ่าน Auth API และ foreign key เท่านั้น ไม่แก้ไข schema โดยตรง

ข้อมูลที่ Auth ดูแล ได้แก่ email/phone, encrypted credential, provider identity, email verification, session และ recovery flow ห้ามทำ column `password` หรือ access token ใน `public` schema

ข้อกำหนดเพิ่มเติม:

- การปิดบัญชีต้องอัปเดต `profiles.status = 'disabled'` และใช้ Admin Auth API ระงับ/ban ผู้ใช้ เพื่อไม่ให้สร้าง session ใหม่
- API ทุกคำขอต้องตรวจ `profiles.status = 'active'` เพิ่มเติม เพราะ access token เดิมอาจยังไม่หมดอายุ
- การลบ `auth.users` ต้องทำผ่าน controlled server-side operation และเขียน audit ก่อนลบ

### 5.2 `profiles` — โปรไฟล์และสถานะบัญชี

| Column | Type | Null | Default / Constraint | ความหมาย |
| --- | --- | ---: | --- | --- |
| `id` | `uuid` | ไม่ | PK, FK → `auth.users.id` ON DELETE CASCADE | รหัสเดียวกับ Auth user |
| `display_name` | `text` | ได้ | ความยาว 1–120 เมื่อมีค่า | ชื่อที่ใช้แสดงผล ไม่ใช้ตัดสินสิทธิ์ |
| `status` | `account_status` | ไม่ | `active` | สถานะการใช้งานบัญชี |
| `locale` | `text` | ไม่ | `th-TH` | ภาษา/รูปแบบแสดงผล |
| `timezone` | `text` | ไม่ | `Asia/Bangkok` | IANA timezone |
| `last_seen_at` | `timestamptz` | ได้ |  | เวลาที่ใช้งานล่าสุด; อัปเดตแบบ throttled |
| `deactivated_at` | `timestamptz` | ได้ | ต้องมีเมื่อ status เป็น `disabled` | เวลาปิดบัญชี |
| `deactivated_by` | `uuid` | ได้ | FK → `auth.users.id` ON DELETE SET NULL | Admin ผู้ปิดบัญชี |
| `created_at` | `timestamptz` | ไม่ | `now()` | เวลาสร้าง |
| `updated_at` | `timestamptz` | ไม่ | `now()` | เวลาแก้ไขล่าสุด |

Constraints สำคัญ:

- `status = 'disabled'` ต้องมี `deactivated_at`; status อื่นต้องไม่มี
- ผู้ใช้แก้เองได้เฉพาะ `display_name`, `locale`, `timezone`; status แก้ได้เฉพาะ Admin/server
- trigger หลังสร้าง `auth.users` สร้าง `profiles` และ `user_roles` ค่าเริ่มต้นเป็น `user` ใน transaction เดียวกัน

Indexes:

- `profiles(status)` แบบ partial index เฉพาะ row ที่ไม่ใช่ `active` สำหรับหน้า Admin
- ไม่ทำ index ที่ `display_name` จนกว่าจะยืนยันว่าต้องค้นหาด้วยชื่อ

### 5.3 `user_roles` — บทบาทปัจจุบันของผู้ใช้

| Column | Type | Null | Default / Constraint | ความหมาย |
| --- | --- | ---: | --- | --- |
| `user_id` | `uuid` | ไม่ | PK, FK → `auth.users.id` ON DELETE CASCADE | หนึ่งผู้ใช้มีหนึ่ง role |
| `role` | `app_role` | ไม่ | `user` | บทบาทปัจจุบัน |
| `granted_by` | `uuid` | ได้ | FK → `auth.users.id` ON DELETE SET NULL | Admin ผู้กำหนด; null เฉพาะ bootstrap/system |
| `granted_at` | `timestamptz` | ไม่ | `now()` | เวลากำหนด role ล่าสุด |
| `reason` | `text` | ได้ | ความยาวไม่เกิน 500 | เหตุผลประกอบการเปลี่ยน |

กฎธุรกิจ:

- Client ห้าม insert/update/delete โดยตรง ให้เรียก security-definer function เช่น `admin_set_user_role(target_user_id, new_role, reason)`
- function ต้อง lock row, ตรวจ actor เป็น Admin, ป้องกัน Admin คนสุดท้ายลด role ตัวเอง และเขียน `audit_logs` ที่มีค่าก่อน/หลังใน transaction เดียวกัน
- JWT claim อาจ cache role เพื่อความเร็ว แต่ฐานข้อมูลคือ source of truth; การกระทำสำคัญต้องตรวจ role ปัจจุบันจากฐานข้อมูล
- หากใช้ role ใน JWT ต้องกำหนดกลไก refresh/revoke session เพื่อให้ผ่าน acceptance criterion “การเปลี่ยน role มีผลภายในเวลาที่ตกลงกัน”

Indexes: enum มี cardinality ต่ำ จึงไม่ต้อง index `role` สำหรับ MVP; เพิ่มเมื่อข้อมูลจริงและ query plan แสดงความจำเป็น

### 5.4 `audit_logs` — บันทึกตรวจสอบย้อนกลับ

| Column | Type | Null | Default / Constraint | ความหมาย |
| --- | --- | ---: | --- | --- |
| `id` | `bigint generated always as identity` | ไม่ | PK | ลำดับภายใน |
| `occurred_at` | `timestamptz` | ไม่ | `now()` | เวลาเกิดเหตุการณ์ |
| `actor_user_id` | `uuid` | ได้ | FK → `auth.users.id` ON DELETE SET NULL | ผู้กระทำ; null สำหรับ system/anonymous |
| `actor_role` | `app_role` | ได้ | snapshot | role ณ เวลาที่กระทำ |
| `actor_label` | `text` | ได้ | sanitized snapshot | ชื่อ/identifier สำหรับสืบค้นหลังลบบัญชี; หลีกเลี่ยง email หากไม่จำเป็น |
| `action` | `text` | ไม่ | รูปแบบ `domain.verb` | เช่น `auth.login`, `user.role_changed` |
| `resource_type` | `text` | ได้ |  | เช่น `user`, `system_setting` |
| `resource_id` | `text` | ได้ |  | ใช้ text เพื่อรองรับ UUID/bigint โดยไม่ทำ polymorphic FK |
| `result` | `audit_result` | ไม่ |  | ผลลัพธ์ |
| `old_values` | `jsonb` | ได้ | object เท่านั้น | ค่าก่อนเปลี่ยนที่ผ่าน allowlist |
| `new_values` | `jsonb` | ได้ | object เท่านั้น | ค่าหลังเปลี่ยนที่ผ่าน allowlist |
| `request_id` | `uuid` | ได้ |  | เชื่อมกับ application log/trace |
| `ip_address` | `inet` | ได้ | ตาม privacy policy | เก็บเฉพาะเมื่อมีฐานทางนโยบาย |
| `user_agent` | `text` | ได้ | จำกัดความยาว | ข้อมูลช่วยสืบสวน |
| `metadata` | `jsonb` | ไม่ | `{}` และต้องเป็น object | รายละเอียดที่ไม่มี secret/credential |

Indexes:

- `(occurred_at DESC)` สำหรับ ledger ล่าสุด
- `(actor_user_id, occurred_at DESC)` WHERE `actor_user_id IS NOT NULL`
- `(resource_type, resource_id, occurred_at DESC)` WHERE `resource_id IS NOT NULL`
- `(action, occurred_at DESC)`
- `(result, occurred_at DESC)` WHERE `result IN ('failure', 'denied')`

กฎความปลอดภัย:

- เป็น append-only: ไม่มี update/delete policy สำหรับ client และควรมี trigger ปฏิเสธ update/delete แม้เกิดจาก application role
- เขียนผ่าน trusted function/server เท่านั้น; Admin อ่านได้แต่แก้ไขไม่ได้
- ห้ามเก็บ password, token, cookie, secret, notification body ที่อ่อนไหว หรือ payload เต็มโดยอัตโนมัติ
- เหตุการณ์ขั้นต่ำ: `auth.login_succeeded`, `auth.login_failed`, `auth.permission_denied`, `user.role_changed`, `user.disabled`, `user.enabled`, `data.deleted`, `setting.updated`
- กำหนด retention ก่อน production; หากปริมาณมากจึงค่อย partition รายเดือน ไม่จำเป็นสำหรับ MVP

### 5.5 `system_settings` — การตั้งค่าระบบ

| Column | Type | Null | Default / Constraint | ความหมาย |
| --- | --- | ---: | --- | --- |
| `key` | `text` | ไม่ | PK, lowercase dot notation | เช่น `auth.allow_signup` |
| `value` | `jsonb` | ไม่ |  | ค่า setting ที่ validate ตาม key |
| `description` | `text` | ได้ |  | คำอธิบายสำหรับ Admin |
| `is_public` | `boolean` | ไม่ | `false` | client ที่ไม่ใช่ Admin อ่านได้หรือไม่ |
| `updated_by` | `uuid` | ได้ | FK → `auth.users.id` ON DELETE SET NULL | ผู้แก้ล่าสุด |
| `created_at` | `timestamptz` | ไม่ | `now()` | เวลาสร้าง |
| `updated_at` | `timestamptz` | ไม่ | `now()` | เวลาแก้ล่าสุด |

กฎธุรกิจ:

- เขียนผ่าน `admin_update_setting(key, value)` ซึ่ง validate ชนิด/ช่วงค่าตาม allowlist และเขียน audit ใน transaction เดียวกัน
- `is_public = true` หมายถึงข้อมูลที่ authenticated user อ่านได้ ไม่ได้หมายถึงเผยแพร่สู่ anonymous โดยอัตโนมัติ
- ห้ามเก็บ secret ทุกชนิด แม้ตั้ง `is_public = false`

### 5.6 `notifications` — กล่องแจ้งเตือนและผลการส่ง

| Column | Type | Null | Default / Constraint | ความหมาย |
| --- | --- | ---: | --- | --- |
| `id` | `uuid` | ไม่ | PK, `gen_random_uuid()` | รหัส notification |
| `recipient_user_id` | `uuid` | ไม่ | FK → `auth.users.id` ON DELETE CASCADE | ผู้รับ |
| `event_name` | `text` | ไม่ | รูปแบบ `domain.verb` | เหตุผลการแจ้งเตือน |
| `channel` | `notification_channel` | ไม่ |  | ช่องทาง |
| `title` | `text` | ไม่ | 1–160 ตัวอักษร | หัวข้อ |
| `body` | `text` | ไม่ | 1–4,000 ตัวอักษร | เนื้อหา plain text |
| `action_url` | `text` | ได้ | ต้องเป็น relative URL ที่อนุญาต | ป้องกัน open redirect |
| `status` | `notification_status` | ไม่ | `queued` | สถานะการส่ง |
| `idempotency_key` | `text` | ไม่ | UNIQUE | ป้องกันส่งซ้ำต่อเหตุการณ์/ผู้รับ/ช่องทาง |
| `provider_message_id` | `text` | ได้ |  | รหัสจาก email provider |
| `attempt_count` | `smallint` | ไม่ | `0`, ต้อง ≥ 0 | จำนวนครั้งที่ลองส่ง |
| `scheduled_at` | `timestamptz` | ไม่ | `now()` | เวลาที่เริ่มส่งได้ |
| `sent_at` | `timestamptz` | ได้ |  | เวลาส่ง |
| `delivered_at` | `timestamptz` | ได้ |  | เวลายืนยัน delivery |
| `failed_at` | `timestamptz` | ได้ |  | เวลาล้มเหลวล่าสุด |
| `failure_code` | `text` | ได้ | ไม่เก็บ raw provider response | สาเหตุแบบ sanitized |
| `read_at` | `timestamptz` | ได้ | ใช้กับ in-app | เวลาอ่าน |
| `created_at` | `timestamptz` | ไม่ | `now()` | เวลาสร้าง |

Indexes:

- `(recipient_user_id, created_at DESC)` สำหรับกล่องแจ้งเตือน
- `(recipient_user_id, created_at DESC)` WHERE `channel = 'in_app' AND read_at IS NULL` สำหรับ unread
- `(status, scheduled_at)` WHERE `status IN ('queued', 'failed')` สำหรับ worker
- unique `idempotency_key`

RLS: ผู้รับอ่าน notification ของตนและแก้ได้เฉพาะ `read_at`; Admin ไม่ควรอ่านเนื้อหาของทุกคนโดยอัตโนมัติ เว้นแต่ requirement ด้าน support ยืนยัน ผู้ส่ง/worker ใช้ service role

### 5.7 `notification_preferences` — ความต้องการรับแจ้งเตือน

| Column | Type | Null | Default / Constraint | ความหมาย |
| --- | --- | ---: | --- | --- |
| `user_id` | `uuid` | ไม่ | PK ส่วนที่ 1, FK → `auth.users.id` ON DELETE CASCADE | เจ้าของ preference |
| `event_name` | `text` | ไม่ | PK ส่วนที่ 2 | ประเภทเหตุการณ์ |
| `channel` | `notification_channel` | ไม่ | PK ส่วนที่ 3 | ช่องทาง |
| `enabled` | `boolean` | ไม่ | `true` | เปิด/ปิดรับ |
| `created_at` | `timestamptz` | ไม่ | `now()` | เวลาสร้าง |
| `updated_at` | `timestamptz` | ไม่ | `now()` | เวลาแก้ล่าสุด |

RLS: ผู้ใช้จัดการได้เฉพาะ preference ของตน ต้องมี registry ใน application/server ว่า event ใดเป็น mandatory security message และห้ามปิด

### 5.8 `product_events` — Product analytics

| Column | Type | Null | Default / Constraint | ความหมาย |
| --- | --- | ---: | --- | --- |
| `id` | `bigint generated always as identity` | ไม่ | PK | รหัส event |
| `occurred_at` | `timestamptz` | ไม่ | เวลา server, default `now()` | เวลาเกิด |
| `user_id` | `uuid` | ได้ | FK → `auth.users.id` ON DELETE SET NULL | ผู้ใช้เมื่อระบุตัวตนแล้ว |
| `anonymous_id` | `uuid` | ได้ | อย่างน้อย user/anonymous ต้องมีหนึ่งค่า | เชื่อม pre-sign-up session |
| `session_id` | `uuid` | ได้ |  | session เชิง analytics ไม่ใช่ auth token |
| `event_name` | `text` | ไม่ | allowlist | ชื่อเหตุการณ์ |
| `properties` | `jsonb` | ไม่ | `{}` และต้องเป็น object | dimension ที่ผ่าน schema validation |
| `request_id` | `uuid` | ได้ |  | เชื่อมกับ trace โดยไม่เก็บ payload |
| `schema_version` | `smallint` | ไม่ | `1`, ต้อง > 0 | เวอร์ชัน event contract |

Event allowlist เริ่มต้นตาม PRD:

- `sign_up_completed`
- `login_succeeded`, `login_failed`
- `role_changed`
- `core_workflow_started`, `core_workflow_completed`, `core_workflow_failed`
- `primary_entity_created`, `primary_entity_updated`, `primary_entity_deleted`
- `permission_denied`
- `notification_sent`

Indexes:

- `(event_name, occurred_at DESC)`
- `(user_id, occurred_at DESC)` WHERE `user_id IS NOT NULL`
- `(anonymous_id, occurred_at DESC)` WHERE `anonymous_id IS NOT NULL`

การเขียนต้องผ่าน server/ingestion function เพื่อ validate allowlist, property schema, timestamp skew และ rate limit ผู้ใช้ไม่ควร query raw events ของผู้อื่น; dashboard analytics ใช้ aggregate view หรือ server endpoint

## 6. Row Level Security matrix

`authenticated` ไม่ได้แปลว่าได้รับสิทธิ์ Admin ทุก policy ต้องตรวจทั้ง role และ account status

| ตาราง | Anonymous | User | Admin | Service role / trusted server |
| --- | --- | --- | --- | --- |
| `profiles` | ไม่มีสิทธิ์ | SELECT/UPDATE field ที่อนุญาตของตน | SELECT ทั้งหมด; เปลี่ยน status ผ่าน function | จัดการ lifecycle |
| `user_roles` | ไม่มีสิทธิ์ | SELECT role ของตน | SELECT ทั้งหมด; เปลี่ยนผ่าน function | bootstrap/sync claims |
| `audit_logs` | ไม่มีสิทธิ์ | ไม่มีสิทธิ์ | SELECT เท่านั้น | INSERT ผ่าน trusted path |
| `system_settings` | ไม่มีโดยค่าเริ่มต้น | SELECT เฉพาะ `is_public` | SELECT ทั้งหมด; UPDATE ผ่าน function | seed/manage |
| `notifications` | ไม่มีสิทธิ์ | SELECT ของตน; mark read ของตน | เท่ากับ User โดยค่าเริ่มต้น | INSERT และอัปเดต delivery |
| `notification_preferences` | ไม่มีสิทธิ์ | CRUD ของตน | เท่ากับ User โดยค่าเริ่มต้น | บังคับ mandatory rules |
| `product_events` | ไม่มีสิทธิ์ | ไม่มี raw read/write | อ่านเฉพาะ aggregate ที่อนุมัติ | INSERT/aggregate/retention |

Helper function ที่ใช้ใน policy เช่น `is_admin()` ต้อง:

- ใช้ `auth.uid()` และตรวจ `profiles.status = 'active'`
- อ่าน `user_roles` ด้วย `SECURITY DEFINER`, กำหนด `search_path` ตายตัว และ revoke execute จาก role ที่ไม่จำเป็น
- ไม่รับ `user_id` จาก client เพื่อใช้แทน actor

Service-role key ห้ามอยู่ใน browser bundle โดยเด็ดขาด

## 7. Transaction และ function ที่จำเป็น

ควรสร้าง operation ต่อไปนี้เป็น database function หรือ server-side transaction เดียว เพื่อไม่ให้ข้อมูลหลักสำเร็จแต่ audit ล้มเหลว:

1. `handle_new_auth_user()` — สร้าง `profiles` และ `user_roles(role='user')` หลัง signup
2. `admin_set_user_role(target_user_id, new_role, reason)` — ตรวจ Admin, ป้องกัน last-admin lockout, เปลี่ยน role, audit และกระตุ้น session/claim refresh
3. `admin_set_account_status(target_user_id, new_status, reason)` — เปลี่ยน status และ audit; ฝั่ง server เรียก Auth Admin API เพื่อ ban/unban ให้สอดคล้องกัน
4. `admin_update_setting(key, value)` — validate allowlist, update และ audit old/new values
5. `mark_notification_read(notification_id)` — อัปเดตได้เฉพาะ notification ของ caller
6. `record_audit_event(...)` — internal-only; sanitize metadata และใช้ server timestamp
7. `track_product_event(...)` — validate event registry/properties และไม่รับ PII ที่อยู่นอก allowlist

การเชิญผู้ใช้และ password recovery ให้ใช้ Supabase Auth Admin/API flow ไม่สร้าง token เองในฐานข้อมูลแอป

## 8. Core workflow ที่ยังรอ requirement

เมื่อ domain ได้รับการยืนยัน ให้เพิ่ม schema เฉพาะทางแทนการใช้ตาราง generic หรือ JSONB เป็นแหล่งข้อมูลหลัก โดยต้องตอบอย่างน้อย:

| ประเด็น | คำตอบที่ต้องได้ก่อนออกแบบ |
| --- | --- |
| Entity | สิ่งที่ผู้ใช้สร้าง/จัดการคืออะไร และมี natural key หรือไม่ |
| Ownership | เป็นของ user, organization, team หรือ project |
| Fields | field บังคับ, type, หน่วย, validation และข้อมูลอ่อนไหว |
| Lifecycle | draft/submitted/approved/rejected หรือสถานะจริงของ domain |
| Transition | ใครเปลี่ยนจากสถานะใดไปสถานะใด ภายใต้เงื่อนไขอะไร |
| Review | มี reviewer จริงหรือไม่; assign อย่างไร; ต้องมีหลายขั้นหรือไม่ |
| Deletion | soft delete, hard delete, restore และ retention |
| Search/export | field ที่ค้นหา/กรอง/เรียง/export และปริมาณข้อมูล |
| Concurrency | ต้อง optimistic lock (`version`) หรือ idempotency key หรือไม่ |
| Audit | field/transition ใดต้องเก็บ before/after |

รูปแบบตารางที่คาดว่าจะเพิ่มหลังยืนยัน (เป็นเพียง pattern ไม่ใช่ schema ที่อนุมัติ):

- `<primary_entities>` — ข้อมูลหลัก, owner, status, `created_at`, `updated_at`, optional `deleted_at`, optional `version`
- `<workflow_transitions>` — entity, from/to status, actor, reason, occurred_at
- `<assignments>` — entity, assignee/reviewer, assigned_by, due_at, completed_at
- `<attachments>` — metadata และ storage path; เก็บไฟล์จริงใน Supabase Storage ไม่เก็บ binary ใน Postgres

อย่าสร้างตารางชื่อ `primary_entities` หรือ `workflow_items` จริง เพราะจะซ่อน domain model และทำให้ validation/authorization อ่อนลง

## 9. Data lifecycle, privacy และ recovery

ก่อน production ต้องทำ data inventory และกำหนด owner/retention รายตาราง ค่าเริ่มต้นเพื่อการหารือ (ยังไม่ใช่นโยบายอนุมัติ):

| ข้อมูล | แนวทาง |
| --- | --- |
| Auth/profile | เก็บระหว่างบัญชี active; เมื่อขอลบให้ disable ก่อน แล้ว anonymize/delete ตามข้อกำหนด |
| Audit log | retention แยกตาม compliance; จำกัดผู้เข้าถึงและคง actor snapshot เท่าที่จำเป็น |
| Notification | ลบ body ก่อน metadata หากเนื้อหามีข้อมูลส่วนบุคคล |
| Product events | retention สั้นกว่า audit; anonymize/delete `user_id` เมื่อหมดวัตถุประสงค์ |
| Backup | เปิด point-in-time recovery ตามแผนบริการ; ทดสอบ restore และบันทึก RPO/RTO |

Deletion workflow ต้องครอบคลุม `auth.users`, `profiles`, storage object, notification และ domain data พร้อม audit การร้องขอและผลลัพธ์ โดยไม่ลบ audit record ที่จำเป็นต่อกฎหมายอย่างเงียบ ๆ

## 10. Migration และ seed strategy

ลำดับ migration ที่แนะนำ:

1. Extensions ที่จำเป็น (`pgcrypto` หาก environment ยังไม่มี)
2. Enum types
3. `profiles`, `user_roles`
4. Helper functions และ trigger สร้าง user foundation
5. `audit_logs` และ append-only protection
6. Admin functions สำหรับ role/status
7. `system_settings`
8. `notifications`, `notification_preferences`
9. `product_events`
10. RLS policies, grants และ security tests

Seed เฉพาะค่าที่ deterministic เช่น setting registry ห้าม seed production user ด้วย email/password ใน migration

Bootstrap Admin คนแรกควรทำผ่านคำสั่ง one-time ใน trusted environment แล้ว audit เป็น `system.bootstrap_admin`; หลังจากนั้นทุก role change ใช้ Admin flow ปกติ

ทุก migration ต้อง forward-only, อยู่ใน source control และทดสอบกับฐานข้อมูลว่างรวมถึงฐานข้อมูลที่มีข้อมูล หลีกเลี่ยงการเปลี่ยน enum/column แบบทำให้ deploy เก่าและใหม่ทำงานพร้อมกันไม่ได้

## 11. Validation และ test checklist

- ผู้ใช้ใหม่ได้ `profiles` และ role `user` ครบ หรือ signup rollback อย่างชัดเจน
- User อ่าน/แก้ได้เฉพาะ profile, notification และ preference ของตน
- User เปิด Admin route ผ่าน API/RPC ไม่ได้ แม้ส่ง user id หรือ role ปลอม
- Admin อ่านหน้าจัดการผู้ใช้และ audit ledger ได้
- การเปลี่ยน role/status เขียน actor, เวลา, target, result และ before/after ครบ
- การลด role ของ Admin คนสุดท้ายถูกปฏิเสธ
- บัญชี disabled สร้าง session ใหม่ไม่ได้ และ access token เดิมทำงานสำคัญไม่ได้
- Client update/delete `audit_logs` ไม่ได้ รวมถึง Admin
- notification event เดิมไม่ถูกสร้างซ้ำเมื่อ retry ด้วย idempotency key เดิม
- User mark-read notification ของผู้อื่นไม่ได้
- Setting ที่ไม่อยู่ allowlist หรือมีชนิดผิดถูกปฏิเสธ
- Product event ที่ชื่อ/property ไม่ผ่าน registry ถูกปฏิเสธ และไม่มี PII/secret หลุดเข้า payload
- Cascade/SET NULL ทำงานตามคาดเมื่อทดสอบ account deletion
- Query หน้า Admin ล่าสุดใช้ index และกำหนด pagination แบบ cursor ไม่โหลดทั้งหมด
- Backup restore และ retention job ถูกทดสอบก่อน production

## 12. Requirement traceability

| Requirement | ส่วนฐานข้อมูลที่รองรับ | สถานะ |
| --- | --- | --- |
| FR-01 Authentication | `auth.users`, Supabase Auth | พร้อมออกแบบ |
| FR-02 Authorization ทุกคำขอ | `user_roles`, RLS, `is_admin()` | พร้อมออกแบบ |
| FR-03 Core workflow | รอ primary entity และ workflow จริง | **Blocked by product decision** |
| FR-04 Input validation | constraints/function สำหรับ foundation; domain validation รอ requirement | บางส่วน |
| FR-05 แสดงข้อมูล/สถานะตามสิทธิ์ | RLS; domain status รอ requirement | บางส่วน |
| FR-06 Admin จัดการผู้ใช้และ role | `profiles`, `user_roles`, Admin functions | พร้อมออกแบบ |
| FR-07 Audit log | `audit_logs`, append-only rules | พร้อมออกแบบ |
| FR-08 Notification | `notifications`, `notification_preferences` | Proposed; รอยืนยันช่องทาง/event |
| Analytics events | `product_events` และ event registry | Proposed |
| Privacy/retention | lifecycle controls; รอนโยบายจริง | ต้องยืนยัน |

## 13. Decisions ที่ Product owner ต้องยืนยันถัดไป

1. Core business entity และ workflow แรกของ MVP คืออะไร
2. การสมัครเป็น self-signup, invite-only หรือสร้างโดย Admin
3. ต้องค้นหาผู้ใช้ด้วย email/name หรือไม่ และ Admin เห็น PII ระดับใด
4. role change ต้องมีผลภายในกี่วินาที และจะ revoke session เดิมทันทีหรือไม่
5. มี organization/team/project scope หรือระบบเป็น single-tenant
6. Notification ใช้ in-app, email หรือทั้งคู่ และ event ใดเป็น mandatory
7. ประเทศ/กฎหมายที่บังคับใช้, ประเภท PII และ retention ของ audit/analytics
8. ปริมาณผู้ใช้, event ต่อวัน, SLA, RPO และ RTO เป้าหมาย
9. Reviewer/approval เป็นบทบาทแยกหรือเป็นเพียงงานของ `Admin`/`User`

เมื่อข้อ 1 และ 5 ได้คำตอบ ต้องทบทวน ERD และ RLS ก่อนสร้าง migration ของ domain เพราะสองข้อนี้มีผลต่อ foreign key และขอบเขตการมองเห็นข้อมูลมากที่สุด
