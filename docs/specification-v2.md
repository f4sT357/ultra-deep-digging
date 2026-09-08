# Ultra Deep Digging — Specification v2

## 1. Purpose

Ultra Deep Diggingは、ユーザーの表面的な要求を処理するのではなく、対話・調査・推論を通じてユーザーが本当に達成したいことを明らかにし、その達成へ導く。

## 2. Core Problem

一般的なアシスタントは、ユーザーが提示したタスクを正しいものとして扱い、そのタスクをより具体的にする。

Ultra Deep Diggingでは、ユーザーの最初の要求そのものを仮説として扱う。

ユーザーが指定した手段・カテゴリ・前提が、本当に目的達成に必要なのかを検討し、対話や調査によって問題設定そのものを更新できることを重視する。

### 2.1 Requirement Clarification vs. Objective Discovery

Requirement Clarificationは、提示されたタスクを目的として受け入れ、「どう実行するか」を明確にする。

Objective Discoveryは、提示されたタスク自体を目的についての仮説として扱い、「そもそも何を達成したいのか」を明らかにする。

違いは、質問が浅いか深いかではない。

**現在の問題設定そのものを維持する必要があるのか、変更できるのか**が本質的な違いである。

例えば「美味しいラーメン屋を探して」という要求に対して、単に味・予算・距離を聞くのはRequirement Clarificationである。

一方で、「ラーメンを食べたい」のか「美味しいものを食べたい」のかを確認し、後者ならラーメンという前提を捨てることはObjective Discoveryである。

ユーザーがラーメンそのものを望んでいると確認できた場合は、ラーメンを目的として収束する。

## 3. Objective Is a Hypothesis

システムは「ユーザーの真の目的」を一度で見抜くことを目指さない。

最初の要求から目的についての仮説を作り、対話・調査によって得られたEvidenceを使って継続的に更新する。

内部的には、単一の確定した目的ではなく、必要に応じて複数のObjective Hypothesisを保持できる設計とする。

例えば「ロードバイクのおすすめ」を受けた場合、初期段階では以下のような仮説があり得る。

- ロードバイクそのものが欲しい
- 速く走れる自転車が欲しい
- 軽快に走れる自転車が欲しい
- 見た目が気に入る自転車が欲しい
- 自分で弄って楽しめる自転車が欲しい

これらは最初から正解として確定させず、ユーザーから得られる情報によって更新する。

## 4. Evidence

Objectiveの更新に使うEvidenceには、明示的な要求だけでなく、ユーザーによる否定・訂正・拒絶も含まれる。

特に以下は重要なEvidenceになり得る。

- 「高い」
- 「ダサい」
- 「それはいらない」
- 「別に〜じゃなくていい」
- 「それより〜が重要」
- 以前提示した前提の訂正

これらは単なる追加条件ではなく、現在の問題設定が間違っている可能性を示すシグナルとして扱う。

## 5. Objective Revision

新しいEvidenceによって現在のObjective Hypothesisが不適切だと判断された場合、システムは問題設定を修正できなければならない。

例えば、以下のような変更が許容される。

```text
ロードバイクが欲しい
        ↓
速く走れる自転車が欲しい
        ↓
軽快でカッコいい自転車が欲しい
```

この変更は、最初の要求を無視することではない。

最初の要求を目的についての仮説として扱い、ユーザーとの対話によってより適切な問題設定へ更新した結果である。

ただし、ユーザーが明確に目的を指定した場合、それを勝手に別の目的へ変更してはいけない。

## 6. Grill Me and Research

Ultra Deep Diggingでは、ユーザーから情報を得る手段と外部世界から情報を得る手段を同じ目的探索ループの中で扱う。

### Grill Me

ユーザーへの質問によって、ユーザー自身についてのUnknownを減らす。

質問は情報収集そのものを目的とせず、現在のObjective Hypothesisを評価・更新するために必要なものを優先する。

### Research

外部情報の調査によって、世界についてのUnknownを減らす。

Researchは指定されたテーマを検索するだけではない。

調査結果によってユーザーの前提が誤っていることや、別の選択肢の方が目的達成に適していることが分かった場合、それをObjective Revisionにつなげる。

## 7. Core Loop

```text
Surface Request
      ↓
Objective Hypothesis
      ↓
Unknown / Uncertainty
      ↓
Choose next action
  ├── Grill Me
  ├── Research
  └── Proceed
      ↓
Evidence
      ↓
Evaluate / Update Objective
      ↓
Is the objective sufficiently understood?
  ├── No → loop
  └── Yes → Guide toward result
```

このループは固定回数で回すものではない。

次の質問や調査によって得られる情報の価値が低くなった場合、または目的達成に必要な理解が十分になった場合は停止する。

## 8. Guidance Is the Actual Goal

最終的な目的は、質問に答えることでも、Researchを完了することでもない。

**ユーザーが本当に達成したいことに到達できるよう導くこと**が目的である。

そのため、最終的な結果は当初の要求と同じ形式になるとは限らない。

## 9. Example: Road Bike

以下はUltra Deep Diggingの典型的なObjective Revisionの例である。

```text
「ロードバイクのおすすめある？」
        ↓
用途・予算などを確認
        ↓
「長距離・速く・維持費安・軽さ重視」
        ↓
走行性能と維持費の両立が重要という仮説
        ↓
「15万円は高すぎる」
        ↓
価格制約が強い
        ↓
「見た目ダサいと乗らない」
        ↓
外観・所有満足度が重要
        ↓
「シマノは嫌」
        ↓
一般的なパーツ選定の前提を修正
        ↓
「ハンドルは別にまっすぐでいい」
        ↓
ドロップハンドルが必須という前提を破棄
        ↓
より広い候補集合を探索
```

最終的に、ユーザーが求めているものは「ロードバイク」というカテゴリそのものではなく、例えば以下のような目的として表現できる可能性がある。

> 予算内で、見た目に満足でき、軽快に走れて、自分で維持・カスタマイズして楽しめる自転車が欲しい。

重要なのはこの文章をLLMが最初から「真の目的」として当てることではない。

対話中にユーザーが示したEvidenceを積み重ね、問題設定を更新した結果として、このような目的表現に収束することである。

## 10. Result-Oriented Stopping Condition

質問やResearchを続けること自体を目的にしない。

以下を満たす場合、追加探索の価値が低いと判断して結果提示へ進む。

- Objectiveについて十分な確信がある
- 主要な制約が把握できている
- 結果を選択・提案するための重要なUnknownが残っていない
- 追加の質問やResearchによる改善幅が小さい

## 11. Design Principles

1. 最初の要求を絶対視しない
2. 目的を仮説として扱う
3. Evidenceによって目的を更新する
4. ユーザーの否定・訂正を重要なEvidenceとして扱う
5. 必要なら問題設定そのものを変更する
6. 質問とResearchを同じ探索ループで扱う
7. 質問・Researchを目的化しない
8. ユーザーの目的を勝手に決めつけない
9. 十分に理解できたら収束する
10. 最終的な評価基準は「最初の要求に答えたか」ではなく「ユーザーの本当の目的の達成に近づいたか」とする

## 12. MVP Scope

MVPでは、まずObjective Hypothesisと対話による更新を検証する。

優先する機能は以下とする。

- Surface Requestの受け取り
- Objective Hypothesisの生成
- Unknown / Uncertaintyの抽出
- 次に必要な質問の選択
- ユーザー回答をEvidenceとして取り込む
- Objective Hypothesisの更新
- 十分な理解に達した際の収束

Researchは後から統合可能な構造とするが、MVPでは必須機能としない。

## 13. Not Yet Specified

以下はMVP後に設計する。

- Objective Hypothesisの具体的なデータ構造
- 複数仮説の確信度管理
- 質問の情報価値・Information Gainの評価
- Research Actionの選択アルゴリズム
- Objective Revisionの判定ロジック
- 停止条件の定量化
- 複数LLM / モデル間での性能差への対策
- Research結果のEvidence化

## 14. Non-Goals

Ultra Deep Diggingは以下を目的としない。

- 単なるPrompt Optimizer
- 単なるPrompt Normalizer
- 単なるClarification Bot
- 単なるDeep Research Wrapper
- ユーザーの目的をLLMが一方的に決めるシステム
- 質問回数やResearch量を増やすこと自体を品質とするシステム
