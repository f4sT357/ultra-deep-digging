# MVP Findings

今回のMVPテストでは、表面的な「ロードバイクのおすすめ」という要求から、対話を通じて問題設定そのものが更新されるプロセスを確認した。

## Observed Process

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

## Findings

### 1. Objective Discovery is iterative

「真の目的」を一度で推定するのではなく、ユーザーから得られたEvidenceによってObjective Hypothesisを更新する方が、このシステムの実態に近い。

### 2. Negative evidence is important

「高い」「ダサい」「嫌」「別に〜でいい」といった否定・訂正は単なる追加条件ではなく、現在の問題設定を変更するシグナルになる。

### 3. The task itself may be revised

「ロードバイク」「ドロップハンドル」のようなユーザーの初期指定が、目的達成に必須とは限らない。新しいEvidenceによって、より上位の目的へ問題設定を変更できる必要がある。

### 4. Do not force a single true objective

LLMが「あなたの本当の目的はこれです」と一発で決める設計は、モデルの推測に依存しすぎる。

MVPではObjectiveを仮説として扱い、Evidenceによる更新を中心に設計する。

## MVP Implication

次の実装では、LLMに「本質を見抜け」と要求するだけではなく、少なくとも以下の状態を明示的に扱える構造を検討する。

- Surface Request
- Objective Hypothesis
- Unknown / Uncertainty
- Evidence
- Objective Revision
- Next Action

Researchは後から同じループへ統合する。
