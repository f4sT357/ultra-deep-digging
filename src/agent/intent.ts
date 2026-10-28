import type { AgentState } from './state';

/**
 * A plain-text handoff, not a solved task or a claim that all requirements are known.
 * Items inferred by the local model remain unconfirmed until the user reviews them.
 */
export function formatIntentHandoff(state: AgentState): string {
  const { model, surfaceRequest, evidence } = state;
  const confirmed =
    state.confirmation?.objective === model.objective &&
    JSON.stringify(state.confirmation?.requirements) ===
      JSON.stringify(model.requirements);
  const bulletList = (items: string[]) =>
    items.length ? items.map(value => `- ${value}`).join('\n') : '- なし／不明';
  const userAnswers = evidence.filter(item => item.kind === 'user');

  return [
    '# UDD：意図の整理（後段LLMへの引き継ぎ用）',
    'これは目的・要件を整理したものであり、最適な手段や専門的な達成条件を確定したものではありません。',
    '',
    '## 元の依頼（ユーザー原文）',
    surfaceRequest,
    '',
    `## 目的（${confirmed ? 'ユーザー確認済み' : 'ローカルLLMの仮説・未確認'}）`,
    model.objective,
    '',
    `## 要件（${confirmed ? 'ユーザー確認済み' : 'ローカルLLMの整理・未確認'}）`,
    bulletList(model.requirements),
    '',
    '## 会話から抽出した制約（未確認・推測を含む可能性）',
    bulletList(model.constraints),
    '',
    '## 会話から抽出した好み（未確認・推測を含む可能性）',
    bulletList(model.preferences),
    '',
    '## 未解決の事項',
    bulletList(model.unknowns),
    '',
    '## ユーザーの追加回答（原文）',
    bulletList(userAnswers.map(item => item.content)),
    '',
    '## 後段LLMへの依頼',
    '確認済み事項と仮説を区別してください。不明な条件は勝手に確定せず、必要に応じて質問・調査し、専門的な成功条件と解決手段を検討してください。',
  ].join('\n');
}
