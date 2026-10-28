const form = document.querySelector('#research-form');
const queryField = document.querySelector('#query');
const submitButton = document.querySelector('#submit-button');
const continueButton = document.querySelector('#continue-button');
const activity = document.querySelector('#activity');
const questionsPanel = document.querySelector('#questions-panel');
const questionsList = document.querySelector('#questions-list');
const resultPanel = document.querySelector('#result-panel');
const resultTitle = document.querySelector('#result-title');
const resultContent = document.querySelector('#result-content');
const learningsDetails = document.querySelector('#learnings-details');
const learningsList = document.querySelector('#learnings-list');
const sourcesDetails = document.querySelector('#sources-details');
const sourcesList = document.querySelector('#sources-list');
const modelSelect = document.querySelector('#model-select');
const intentPanel = document.querySelector('#intent-panel');
const intentObjective = document.querySelector('#intent-objective');
const intentRequirements = document.querySelector('#intent-requirements');
const intentHandoff = document.querySelector('#intent-handoff');
const intentConfirmationStatus = document.querySelector('#intent-confirmation-status');
const confirmIntentButton = document.querySelector('#confirm-intent-button');
const copyIntentButton = document.querySelector('#copy-intent-button');
const reloadModelsButton = document.querySelector('#reload-models-button');

let investigation = null;
let busy = false;

async function loadModels() {
  reloadModelsButton.disabled = true;
  modelSelect.disabled = true;
  document.querySelector('#model-help').textContent = 'LM Studioからモデル一覧を取得しています…';

  try {
    const response = await fetch('/api/models');
    if (!response.ok) throw new Error('モデル一覧を取得できませんでした。');
    const data = await response.json();
    const models = [...new Set(data.models ?? [])];
    const savedModel = localStorage.getItem('udd.modelId');
    const selectedModel = models.includes(savedModel)
      ? savedModel
      : data.selectedModel;

    if (selectedModel && !models.includes(selectedModel)) models.unshift(selectedModel);
    modelSelect.replaceChildren();

    if (models.length === 0) {
      const option = document.createElement('option');
      option.textContent = 'モデルが見つかりません';
      modelSelect.append(option);
      document.querySelector('#model-help').textContent =
        'LM Studioのサーバーを起動して「再読込」を押してください。';
      return;
    }

    models.forEach(modelId => {
      const option = document.createElement('option');
      option.value = modelId;
      option.textContent = modelId;
      modelSelect.append(option);
    });

    modelSelect.value = models.includes(selectedModel) ? selectedModel : models[0];
    modelSelect.disabled = false;
    localStorage.setItem('udd.modelId', modelSelect.value);
    document.querySelector('#model-help').textContent = data.models.length
      ? `${data.models.length}個のモデルを取得しました。選択はこのブラウザーに保存されます。`
      : '一覧を取得できなかったため、設定済みモデルを表示しています。LM Studioのサーバーを確認してください。';
  } catch (error) {
    modelSelect.replaceChildren();
    const option = document.createElement('option');
    option.textContent = 'モデル一覧を取得できません';
    modelSelect.append(option);
    document.querySelector('#model-help').textContent =
      error instanceof Error ? error.message : String(error);
  } finally {
    reloadModelsButton.disabled = false;
  }
}

function setBusy(isBusy) {
  busy = isBusy;
  activity.hidden = !isBusy;
  submitButton.disabled = isBusy;
  continueButton.disabled = isBusy;
  confirmIntentButton.disabled = isBusy;
  copyIntentButton.disabled = isBusy;
  if (isBusy) {
    document.querySelector('#activity-title').textContent = investigation
      ? '回答を反映して調査しています'
      : '目的を整理して調査しています';
  }
}

function setError(message) {
  resultPanel.hidden = false;
  resultTitle.textContent = 'エラー';
  learningsDetails.hidden = true;
  sourcesDetails.hidden = true;
  resultContent.replaceChildren();
  const text = document.createElement('p');
  text.className = 'error';
  text.textContent = message;
  resultContent.append(text);
}

function renderQuestions(questions) {
  questionsList.replaceChildren();
  questions.forEach((question, index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'question-field';

    const label = document.createElement('label');
    label.htmlFor = `answer-${index}`;
    label.textContent = question;

    const input = document.createElement('textarea');
    input.id = `answer-${index}`;
    input.dataset.answer = String(index);
    input.rows = 2;
    input.required = true;
    input.placeholder = '回答を入力';

    wrapper.append(label, input);
    questionsList.append(wrapper);
  });

  questionsPanel.hidden = questions.length === 0;
  if (questions.length > 0) {
    questionsPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function renderList(list, values) {
  list.replaceChildren();
  values.forEach(value => {
    const item = document.createElement('li');
    item.textContent = value;
    list.append(item);
  });
}

function renderSources(urls) {
  sourcesList.replaceChildren();
  urls.forEach(value => {
    try {
      const url = new URL(value);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = url.href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = url.hostname;
      item.append(link);
      sourcesList.append(item);
    } catch {
      // Ignore malformed source URLs.
    }
  });
  sourcesDetails.hidden = sourcesList.childElementCount === 0;
}

function renderResult(data) {
  questionsPanel.hidden = true;
  resultPanel.hidden = false;
  resultContent.replaceChildren();
  const outputMode = form.elements['output-mode'].value;
  const completed = data.status === 'proceed';
  resultTitle.textContent = completed
    ? outputMode === 'report' ? '調査レポート' : '回答'
    : '調査を続ける必要があります';

  const output = document.createElement('pre');
  output.textContent = data[outputMode] ??
    '調査の上限に達しました。設定を調整して、もう一度お試しください。';
  resultContent.append(output);

  renderList(learningsList, data.learnings ?? []);
  learningsDetails.hidden = !data.learnings?.length;
  renderSources(data.visitedUrls ?? []);
  resultPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderIntentReview(data) {
  if (!data.state) return;
  intentPanel.hidden = false;
  resultPanel.hidden = true;
  intentObjective.value = data.state.model.objective;
  intentRequirements.value = data.state.model.requirements.join('\n');
  intentHandoff.textContent = data.handoff || '';
  intentConfirmationStatus.textContent = data.state.confirmation
    ? '目的・要件：ユーザー確認済み。制約・好み・未知点は未確認のままです。'
    : '目的・要件：ローカルLLMによる仮説（未確認）。';
}

async function runInvestigation(answers = []) {
  if (busy) return;

  const outputMode = form.elements['output-mode'].value;
  const request = investigation
    ? {
        query: investigation.state.surfaceRequest,
        breadth: investigation.breadth,
        depth: investigation.depth,
        state: investigation.state,
        learnings: investigation.learnings,
        visitedUrls: investigation.visitedUrls,
        answers,
        modelId: modelSelect.value || undefined,
      }
    : {
        query: queryField.value.trim(),
        breadth: Number(form.elements.breadth.value),
        depth: Number(form.elements.depth.value),
        modelId: modelSelect.value || undefined,
      };

  if (!request.query) {
    queryField.focus();
    return;
  }

  setBusy(true);
  resultPanel.hidden = true;

  try {
    const endpoint = outputMode === 'intent'
      ? '/api/intent'
      : outputMode === 'report'
        ? '/api/generate-report'
        : '/api/research';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || data.error || '調査に失敗しました。');

    investigation = {
      state: data.state,
      learnings: data.learnings ?? [],
      visitedUrls: data.visitedUrls ?? [],
      breadth: request.breadth,
      depth: request.depth,
    };

    if (outputMode === 'intent') {
      renderIntentReview(data);
      if (data.status === 'needs_user_input' && data.questions?.length) {
        renderQuestions(data.questions);
      } else {
        questionsPanel.hidden = true;
        intentPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      if (data.status === 'max_iterations') {
        intentConfirmationStatus.textContent += ' 深掘り上限に達しました。目的が十分に明確とは限りません。';
      }
      return;
    }

    intentPanel.hidden = true;
    if (data.status === 'needs_user_input' && data.questions?.length) {
      renderQuestions(data.questions);
      return;
    }

    renderResult(data);
  } catch (error) {
    setError(error instanceof Error ? error.message : String(error));
  } finally {
    setBusy(false);
  }
}

form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  investigation = null;
  runInvestigation();
});

continueButton.addEventListener('click', () => {
  const answers = [...questionsList.querySelectorAll('[data-answer]')]
    .map(input => input.value.trim());
  if (answers.some(answer => !answer)) {
    questionsList.querySelector('[data-answer]:invalid')?.focus();
    return;
  }
  runInvestigation(answers);
});

confirmIntentButton.addEventListener('click', async () => {
  if (busy || !investigation?.state) return;
  const objective = intentObjective.value.trim();
  if (!objective) {
    intentObjective.focus();
    return;
  }
  const requirements = intentRequirements.value.split('\n').map(value => value.trim()).filter(Boolean);
  setBusy(true);
  try {
    const response = await fetch('/api/confirm-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state: investigation.state, objective, requirements }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || '確認の反映に失敗しました。');
    investigation.state = data.state;
    renderIntentReview(data);
  } catch (error) {
    intentConfirmationStatus.textContent = error instanceof Error ? error.message : String(error);
  } finally {
    setBusy(false);
  }
});

copyIntentButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(intentHandoff.textContent);
    intentConfirmationStatus.textContent = investigation?.state?.confirmation
      ? '確認済みの意図テキストをコピーしました。'
      : '未確認の仮説を含む意図テキストをコピーしました。';
  } catch {
    intentConfirmationStatus.textContent = 'コピーできませんでした。下のテキストを選択してコピーしてください。';
  }
});

modelSelect.addEventListener('change', () => {
  if (modelSelect.value) localStorage.setItem('udd.modelId', modelSelect.value);
});

reloadModelsButton.addEventListener('click', loadModels);

document.querySelector('#new-research-button').addEventListener('click', () => {
  investigation = null;
  form.reset();
  queryField.value = '';
  questionsPanel.hidden = true;
  resultPanel.hidden = true;
  intentPanel.hidden = true;
  queryField.focus();
});

loadModels();
