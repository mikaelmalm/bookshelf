# 📖 Vincents Bokhylla (Vincents Storybooks)

En mysig och premium digital bokhylla och Progressive Web App (PWA) byggd för Vincent för att läsa och lyssna på illustrerade barnböcker skapade med Google Gemini.

Appen är designad för att vara extremt ren, enkel och lättanvänd för barn, med en responsiv layout som fungerar lika bra på surfplattor och mobiler som på datorn.

👉 **[Klicka här för att besöka bokhyllan live!](https://mikaelmalm.github.io/bookshelf/)**

---

## ✨ Funktioner (Features)

- **Barnvänligt gränssnitt**: En avskalad bokhylla i mörkt träpanel där bokomslagen visas stort och tydligt så att det är enkelt att välja saga.
- **Smarta layouter**:
  - *Dator*: Visar klassiska bokuppslag sida vid sida med breda, luftiga marginaler (110px) för en äkta bokkänsla.
  - *Mobil*: Helskärmslayout där bilden täcker överdelen och texten ligger under.
- **Enkel bläddring**: På mobilen trycker man bara på höger sida av skärmen för att bläddra framåt, och vänster sida för att bläddra bakåt. Betydligt enklare för små fingrar än små knappar!
- **Snabba sidladdningar**: Alla bilder förladdas i bakgrunden så fort en bok öppnas, vilket gör att sidorna vänder blixtsnabbt utan väntetid.
- **Ljuduppläsning**: En diskret ljudknapp gör att barnet kan få texten uppläst direkt i webbläsaren.
- **Installera som App (PWA)**: Hemsidan kan sparas på hemskärmen på mobilen eller surfplattan och fungerar helt offline utan internetuppkoppling tack vare lokal cachning.

---

## 📚 Vincents Böcker (The Stories)

Bokhyllan innehåller just nu åtta spännande berättelser:
1. **Vincent och den stora traktorn** 🚜
2. **Vincents stora lopp** 🏃
3. **Vincent, Wilma och brandbilen** 🚒
4. **Vincent på simskola** 🏊
5. **Vincent och den magiska grävmaskinen** 🚧
6. **Vincents och Wilmas stora pooldag** 🏖️
7. **Vincents stora tågresa** 🚂
8. **Vincents stora kranäventyr** 🏗️

---

## 🛠️ Lägg till fler böcker (Add more stories)

För att enkelt bygga ut Vincents bibliotek finns ett inbyggt skrapverktyg. Du behöver bara köra följande kommando med din delningslänk från Gemini:

```bash
bun run add-book <gemini-delningslänk>
```
*(Eller med npm: `npm run add-book -- <gemini-delningslänk>`)*

**Vad skriptet gör:**
1. Öppnar länken i bakgrunden.
2. Laddar ner alla illustrationer lokalt till `public/images/`.
3. Sparar texten och bildreferenserna i bokdatabasen (`src/data/stories.json`).
4. Boken dyker direkt upp som ett nytt omslag på hyllan!

---

## 🚀 Kom igång (Development)

### Köra lokalt
1. Installera verktyg:
   ```bash
   bun install
   ```
2. Starta utvecklingsservern:
   ```bash
   bun run dev
   ```

### Bygga och publicera
1. Kompilera koden:
   ```bash
   bun run build
   ```
2. Driftsätt direkt till GitHub Pages:
   ```bash
   bun run deploy
   ```

---

Skapat med ❤️ för Vincent.
