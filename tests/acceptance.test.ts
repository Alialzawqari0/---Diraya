import assert from "node:assert/strict";
import { MESSAGES, SUGGESTIONS } from "../src/messages";
import { classifyQueryLocally } from "../src/lib/queryRouter";
import { searchQuranDigitalLibrary } from "../src/lib/quranLibrary";

console.log("=== Running Acceptance Tests for Diraya Query Router & Out-of-Scope Behavior ===\n");

// Acceptance Criteria 1: "من هو أفضل لاعب كرة؟" → out_of_scope
{
  const query = "من هو أفضل لاعب كرة؟";
  const result = classifyQueryLocally(query);
  assert.equal(result.intent, "out_of_scope", `Failed on: "${query}"`);
  console.log(`✓ "${query}" → ${result.intent}`);
}

// Acceptance Criteria 2: "اكتب لي كود بايثون" → out_of_scope
{
  const query = "اكتب لي كود بايثون";
  const result = classifyQueryLocally(query);
  assert.equal(result.intent, "out_of_scope", `Failed on: "${query}"`);
  console.log(`✓ "${query}" → ${result.intent}`);
}

// Acceptance Criteria 3: "تفسير آية لا وجود لها ٩٩٩:٩٩٩" → no_result
{
  const query = "تفسير آية لا وجود لها ٩٩٩:٩٩٩";
  const result = classifyQueryLocally(query);
  assert.equal(result.intent, "no_result", `Failed on: "${query}"`);
  console.log(`✓ "${query}" → ${result.intent}`);
}

// Acceptance Criteria 4: "هل يجوز لي كذا؟ حالتي كذا" → ruling_request
{
  const query = "هل يجوز لي كذا؟ حالتي كذا";
  const result = classifyQueryLocally(query);
  assert.equal(result.intent, "ruling_request", `Failed on: "${query}"`);
  console.log(`✓ "${query}" → ${result.intent}`);
}

// Acceptance Criteria 5: "السلام عليكم، وش تسوي؟" → about_app
{
  const query = "السلام عليكم، وش تسوي؟";
  const result = classifyQueryLocally(query);
  assert.equal(result.intent, "about_app", `Failed on: "${query}"`);
  console.log(`✓ "${query}" → ${result.intent}`);
}

// Acceptance Criteria 6: "ما تفسير آية الكرسي؟" → search
{
  const query = "ما تفسير آية الكرسي؟";
  const result = classifyQueryLocally(query);
  assert.equal(result.intent, "search", `Failed on: "${query}"`);
  console.log(`✓ "${query}" → ${result.intent}`);
}

// Acceptance Criteria 7: Distress detection
{
  const query = "ضاقت بي الدنيا وأفكر في الانتحار";
  const result = classifyQueryLocally(query);
  assert.equal(result.intent, "distress", `Failed on: "${query}"`);
  console.log(`✓ "${query}" → ${result.intent}`);
}

// Acceptance Criteria 8: Exact Prescribed Arabic Response Texts in messages.ts
{
  assert.equal(
    MESSAGES.OUT_OF_SCOPE,
    "دِرَايَة أداة بحث مختصة في كتب التفسير، ولا تستطيع الحديث في مواضيع خارج ذلك. اسألني عن آية أو موضوع قرآني وسأبحث لك في التفاسير."
  );
  assert.equal(
    MESSAGES.NO_RESULT,
    "لم أجد في التفاسير المتاحة نصاً يطابق طلبك. جرّب ذكر اسم السورة ورقم الآية، أو اكتب جزءاً من نص الآية."
  );
  assert.equal(
    MESSAGES.RULING_REQUEST,
    "دِرَايَة لا تُفتي ولا تُصدر أحكاماً شخصية، وليست بديلاً عن أهل العلم. إن كان سؤالك متعلقاً بآية، فاذكرها وسأعرض لك ما قاله المفسرون عنها، وللحكم في مسألتك راجع أهل العلم."
  );
  assert.equal(
    MESSAGES.ABOUT_APP,
    "أنا دِرَايَة، أداة بحث في كتب التفسير. أعرض لك ما قاله المفسرون عن الآية أو الموضوع بنصوصهم ومراجعهم، وأساعدك على حفظ ما تجده في مشاريع بحثية."
  );
  assert.equal(
    MESSAGES.DISTRESS,
    "أسأل الله أن يفرّج عنك. دِرَايَة أداة بحث ولا تستطيع مساندتك في هذا، فأنصحك بالحديث مع شخص تثق به أو مختص يقف معك."
  );
  console.log("✓ Exact Arabic strings in messages.ts match specifications verbatim");
}

// Acceptance Criteria 9: Suggestion Rows Specification
{
  assert.equal(SUGGESTIONS.length, 3);
  assert.equal(SUGGESTIONS[0], "ما تفسير آية الكرسي؟");
  assert.equal(SUGGESTIONS[1], "ماذا قال المفسرون عن الصبر؟");
  assert.equal(SUGGESTIONS[2], "تفسير: إن مع العسر يسرا");
  console.log("✓ Three hairline suggestion rows match specifications");
}

// Acceptance Criteria 10: Mock Retrieval Verification (Answers only from retrieved sources)
{
  // Valid search
  const kursiResult = searchQuranDigitalLibrary("ما تفسير آية الكرسي؟", ["muyassar", "saadi"]);
  assert.ok(kursiResult !== null, "Ayah Al-Kursi search must return results");
  assert.equal(kursiResult.ayah.surah, "سورة البقرة");
  assert.equal(kursiResult.ayah.ayahFrom, 255);
  assert.ok(kursiResult.tafsirs.length > 0);

  // Non-existent search query returns null, never guesses or invents
  const nonExistentResult = searchQuranDigitalLibrary("تفسير آية لا وجود لها ٩٩٩:٩٩٩", ["muyassar"]);
  assert.equal(nonExistentResult, null, "Impossible verse must return null (no_result)");

  const irrelevantResult = searchQuranDigitalLibrary("طريقة عمل البيتزا الإيطالية بالفرن", ["muyassar"]);
  assert.equal(irrelevantResult, null, "Unrelated search must return null");

  console.log("✓ Retrieval logic returns valid sources when found and null when absent (no hallucination)");
}

console.log("\n==========================================");
console.log("All Acceptance Unit Tests Passed Successfully!");
console.log("==========================================\n");
