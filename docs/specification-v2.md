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

## 4. Objective, Requirements, Constraints, Preferences

ユーザーの目的と、それを満たすための条件を同一視しない。

少なくとも概念上、以下を分離して扱う。

- **Objective** — ユーザーが達成したい状態・結果
- **Requirements** — その結果を満たすために必要な条件
- **Constraints** — 予算・時間・場所など、選択肢を制限する条件
- **Preferences** — 好み・価値観・優先順位
- **Unknowns** — 現時点で分かっておらず、判断に影響する情報
- **Evidence** — ユーザーや外部世界から得られた根拠

これらは対話によって更新される。

特に、すべてのケースでObjectiveそのものが変化するとは限らない。

Objectiveを維持したままRequirements、Constraints、Preferencesが具体化・深化する場合もある。

したがって、Ultra Deep Diggingは「常に最初の目的を覆す」システムではない。

**必要な場合にはObjectiveをRevisionし、必要な場合にはそのままRequirements等をRefinementするシステムである。**

概念的には次のように扱う。

```text
Objective
    ↓
Requirements / Constraints / Preferences
    ↓
Evidence
    ↓
Update
    ↙      ↘
Objective  Requirements
Revision   Refinement
    ↘      ↙
     Result
```

## 5. Evidence

ObjectiveやRequirements等の更新に使うEvidenceには、明示的な要求だけでなく、ユーザーによる否定・訂正・拒絶も含まれる。

特に以下は重要なEvidenceになり得る。

- 「高い」
- 「ダサい」
- 「それはいらない」
- 「別に〜じゃなくていい」
- 「それより〜が重要」
- 以前提示した前提の訂正

これらは単なる追加条件ではなく、現在の問題設定や候補条件が不適切である可能性を示すシグナルとして扱う。

## 6. Objective Revision and Requirement Refinement

新しいEvidenceによって現在のObjective Hypothesisが不適切だと判断された場合、システムは問題設定を修正できなければならない。

一方、Objectiveが維持される場合は、そのObjectiveを満たすためのRequirements、Constraints、Preferencesを更新する。

例えば、ロードバイクのケースでは、

```text
「ロードバイクが欲しい」
        ↓
「速く走れる自転車が欲しい」
        ↓
「軽快でカッコいい自転車が欲しい」
```

のようにObjectiveの抽象度や対象カテゴリが変化する可能性がある。

一方、万年筆のケースでは、

```text
「万年筆を趣味として楽しみたい」
        ↓
予算：約1,000円台
        ↓
ポップなデザインは避けたい
        ↓
見た目と書き心地を重視
        ↓
クリア軸は劣化が気になるため避けたい
```

のように、Objective自体は比較的維持されたままRequirements、Constraints、Preferencesが深化する。

この違いは重要である。

**Objective Discoveryは「必ず目的を変更すること」ではなく、目的を変更すべき場合と、条件を精緻化すべき場合を区別することである。**

ただし、ユーザーが明確に目的を指定した場合、それを勝手に別の目的へ変更してはいけない。

## 7. Grill Me and Research

Ultra Deep Diggingでは、ユーザーから情報を得る手段と外部世界から情報を得る手段を同じ目的探索ループの中で扱う。

### Grill Me

ユーザーへの質問によって、ユーザー自身についてのUnknownを減らす。

質問は情報収集そのものを目的とせず、現在のObjective、Requirements、Constraints、Preferencesを評価・更新するために必要なものを優先する。

### Research

外部情報の調査によって、世界についてのUnknownを減らす。

Researchは指定されたテーマを検索するだけではない。

調査結果によってユーザーの前提が誤っていることや、別の選択肢の方が目的達成に適していることが分かった場合、それをObjective RevisionやRequirement Refinementにつなげる。

## 8. Core Loop

```text
Surface Request
      ↓
Current Objective / Requirements / Constraints / Preferences
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
Evaluate / Update
      ├── Objective Revision
      └── Requirement Refinement
      ↓
Is the current model sufficiently understood?
  ├── No → loop
  └── Yes → Guide toward result
```

このループは固定回数で回すものではない。

次の質問や調査によって得られる情報の価値が低くなった場合、または目的達成に必要な理解が十分になった場合は停止する。

## 9. Guidance Is the Actual Goal

最終的な目的は、質問に答えることでも、Researchを完了することでもない。

**ユーザーが本当に達成したいことに到達できるよう導くこと**が目的である。

そのため、最終的な結果は当初の要求と同じ形式になるとは限らない。

## 10. Golden Test: Road Bike

以下はObjectiveそのものがRevisionされる典型例である。

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

このケースでは、「ロードバイク」という初期カテゴリが最終目的に必須ではないことが対話によって判明する可能性がある。

## 11. Golden Test: Fountain Pen

以下はObjectiveを維持しながらRequirements、Constraints、Preferencesが深化する典型例である。

```text
「万年筆ほしいな」
        ↓
「趣味。見た目と書きごこちにこだわってる」
        ↓
趣味としての筆記体験がObjectiveとして成立
        ↓
「たかいよおお」「そんなに金ないよ 最初やぞ」
        ↓
低予算・初心者として失敗コストを抑えたい
        ↓
「カクノダサくね」
        ↓
安さだけでなく、大人っぽい外観が重要
        ↓
「ハイエースネオかっこいい」
        ↓
デザインの方向性が具体化
        ↓
「クリアとか劣化するやん 嫌」
        ↓
透明軸を避け、長期的な質感維持を重視
        ↓
候補を絞り込む
```

このケースでは、「万年筆を趣味として楽しみたい」というObjectiveは大きく変更されていない。

変化しているのは主に、予算、デザイン、所有感、耐久性などのRequirements、Constraints、Preferencesである。

## 12. Result-Oriented Stopping Condition

質問やResearchを続けること自体を目的にしない。

以下を満たす場合、追加探索の価値が低いと判断して結果提示へ進む。

- Objectiveについて十分な確信がある
- 主要なRequirements、Constraints、Preferencesが把握できている
- 結果を選択・提案するための重要なUnknownが残っていない
- 追加の質問やResearchによる改善幅が小さい

## 13. Design Principles

1. 最初の要求を絶対視しない
2. Objectiveを仮説として扱う
3. ObjectiveとRequirements等を混同しない
4. Evidenceによって現在のモデルを更新する
5. ユーザーの否定・訂正を重要なEvidenceとして扱う
6. 必要なら問題設定そのものを変更する
7. Objectiveを変更する必要がない場合はRequirements等を精緻化する
8. 質問とResearchを同じ探索ループで扱う
9. 質問・Researchを目的化しない
10. ユーザーの目的を勝手に決めつけない
11. 十分に理解できたら収束する
12. 最終的な評価基準は「最初の要求に答えたか」ではなく「ユーザーの本当の目的の達成に近づいたか」とする

## 14. MVP Scope

MVPでは、まずObjective HypothesisとRequirements等の対話による更新を検証する。

優先する機能は以下とする。

- Surface Requestの受け取り
- Objective Hypothesisの生成
- Requirements / Constraints / Preferencesの抽出
- Unknown / Uncertaintyの抽出
- 次に必要な質問の選択
- ユーザー回答をEvidenceとして取り込む
- Objective RevisionまたはRequirement Refinement
- 十分な理解に達した際の収束

Researchは後から統合可能な構造とするが、MVPでは必須機能としない。

## 15. Not Yet Specified

以下はMVP後に設計する。

- Objective Hypothesisの具体的なデータ構造
- Requirements / Constraints / Preferencesのデータ構造
- 複数仮説の確信度管理
- 質問の情報価値・Information Gainの評価
- Research Actionの選択アルゴリズム
- Objective Revisionの判定ロジック
- 停止条件の定量化
- 複数LLM / モデル間での性能差への対策
- Research結果のEvidence化

## 16. Non-Goals

Ultra Deep Diggingは以下を目的としない。

- 単なるPrompt Optimizer
- 単なるPrompt Normalizer
- 単なるClarification Bot
- 単なるDeep Research Wrapper
- ユーザーの目的をLLMが一方的に決めるシステム
- 質問回数やResearch量を増やすこと自体を品質とするシステム
