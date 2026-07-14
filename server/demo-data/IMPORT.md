# Sirari Fitness demo-data import

These files are MongoDB Extended JSON. They contain linked ObjectIds, so plans,
members, trainers, payments, and attendance populate correctly in the app.

Before importing, use the dashboard **Clear test data** action. Login users are
preserved. Import into the same database used by `MONGODB_URI`.

Import collection files in this order:

1. `plans.json` → collection `plans`
2. `members.json` → collection `members`
3. `trainers.json` → collection `trainers`
4. `leads.json` → collection `leads`
5. `payments.json` → collection `payments`
6. `attendance.json` → collection `attendances`

In MongoDB Compass, open the target collection, choose **Add Data → Import JSON
or CSV**, select the matching file, choose JSON, and import.

Do not import into the `users` collection. Existing login accounts are not part
of the demo dump.
