# F1 Iran Dashboard

داشبورد اطلاعات فرمول یک به زبان فارسی، ساخته\u200cشده با Vue 3، TypeScript و Tailwind CSS.

**آدرس هدف:** [f1.mhkarami97.ir](https://f1.mhkarami97.ir)

## منبع داده: OpenF1 API
  
این پروژه از [OpenF1](https://openf1.org) استفاده می\u200cکند — یک API متن\u200cباز، رایگان و بدون نیاز به کلید برای داده\u200cهای تاریخی (از ۲۰۲۳ به بعد). مستندات کامل: <https://openf1.org/docs>.

- لایسنس داده: Creative Commons Attribution 4.0 (CC BY 4.0)
- داده\u200cهای real-time نیاز به اشتراک پولی دارند؛ به همین دلیل بخش «زنده» با فیچر `REALTIME_DATA_ENABLED` در `src/stores/sessionsStore.ts` کنترل می\u200cشود.
- endpoint‌های `championship_drivers`/`championship_teams` بر اساس `session_key` مسابقه کار می\u200cکنند، نه سال.

## اجرای محلی

```bash
npm install
npm run dev
```

## معماری

- **Repository Pattern** — `IF1Repository`/`OpenF1Repository`
- **Singleton** — `services/httpClient.ts`
- **Strategy** — `services/polling.ts`
- **Facade** — Pinia stores

## دیپلوی

GitHub Actions (`.github/workflows/deploy.yml`) روی هر push به `main`، بعد از type-check و build، خروجی `dist/` را روی شاخه `gh-pages` منتشر می\u200cکند. برای دامنه سفارشی `f1.mhkarami97.ir`، طبق [مستندات GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) یک رکورد CNAME در DNS به `MHKarami97.github.io` بسازید.
