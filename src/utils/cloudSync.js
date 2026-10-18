// クラウド履歴同期モジュール（GitHub Gist API ＆ Cloudflare Pages KV 両対応）

const GIST_FILENAME = 'gachafit_nia_sync.json';

export class CloudSyncManager {
  /**
   * 1. GitHub Gist へ履歴＆カスタム種目データを保存（Push）
   * - gistId が未指定の場合は新規シークレットGistを自動作成し、発行された gistId を返す
   */
  async pushToGist({ token, gistId, payload }) {
    if (!token) {
      throw new Error('GitHub Personal Access Token (PAT) を入力してください');
    }

    const headers = {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token.trim()}`,
      'Content-Type': 'application/json'
    };

    const bodyData = {
      description: 'GachaFit with Nia - Workout History & Custom Exercises Sync',
      public: false,
      files: {
        [GIST_FILENAME]: {
          content: JSON.stringify(
            {
              updatedAt: new Date().toISOString(),
              ...payload
            },
            null,
            2
          )
        }
      }
    };

    const url = gistId?.trim()
      ? `https://api.github.com/gists/${gistId.trim()}`
      : 'https://api.github.com/gists';

    const method = gistId?.trim() ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(bodyData)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`GitHub Gist保存失敗 (${res.status}): ${errText}`);
    }

    const data = await res.json();
    return {
      gistId: data.id,
      updatedAt: data.updated_at
    };
  }

  /**
   * 2. GitHub Gist から履歴＆カスタム種目データを取得（Pull）
   */
  async pullFromGist({ token, gistId }) {
    if (!gistId?.trim()) {
      throw new Error('Gist ID が設定されていません（初回は先に「クラウドへ保存」を押すと自動発行されます）');
    }

    const headers = {
      Accept: 'application/vnd.github+json'
    };
    if (token?.trim()) {
      headers.Authorization = `Bearer ${token.trim()}`;
    }

    const res = await fetch(`https://api.github.com/gists/${gistId.trim()}`, {
      method: 'GET',
      headers
    });

    if (!res.ok) {
      throw new Error(`GitHub Gist取得失敗 (${res.status})`);
    }

    const data = await res.json();
    const fileObj = data.files?.[GIST_FILENAME];
    if (!fileObj || !fileObj.content) {
      throw new Error(`Gist内に ${GIST_FILENAME} が見つかりません`);
    }

    return JSON.parse(fileObj.content);
  }

  /**
   * 3. Cloudflare Pages Functions (/api/sync) へ保存（Push）
   */
  async pushToCloudflareKV({ syncKey, payload }) {
    if (!syncKey?.trim()) {
      throw new Error('同期用シークレットキー（合言葉）を入力してください');
    }

    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Sync-Key': syncKey.trim()
      },
      body: JSON.stringify({
        updatedAt: new Date().toISOString(),
        ...payload
      })
    });

    if (!res.ok) {
      throw new Error(`Cloudflare KV保存失敗 (${res.status})`);
    }

    return await res.json();
  }

  /**
   * 4. Cloudflare Pages Functions (/api/sync) から取得（Pull）
   */
  async pullFromCloudflareKV({ syncKey }) {
    if (!syncKey?.trim()) {
      throw new Error('同期用シークレットキー（合言葉）を入力してください');
    }

    const res = await fetch('/api/sync', {
      method: 'GET',
      headers: {
        'X-Sync-Key': syncKey.trim()
      }
    });

    if (!res.ok) {
      throw new Error(`Cloudflare KV取得失敗 (${res.status})`);
    }

    return await res.json();
  }
}

export const cloudSync = new CloudSyncManager();
