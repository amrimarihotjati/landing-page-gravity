import { NextResponse } from 'next/server';

const REPO_OWNER = 'amrimarihotjati';
const REPO_NAME = 'landing-page-gravity';
const BRANCH = 'main';

async function getFileSha(path, token) {
  const url = \`https://api.github.com/repos/\${REPO_OWNER}/\${REPO_NAME}/contents/\${path}?ref=\${BRANCH}\`;
  const res = await fetch(url, {
    headers: {
      Authorization: \`token \${token}\`,
      Accept: 'application/vnd.github.v3+json',
    },
    cache: 'no-store'
  });
  if (!res.ok) {
    if (res.status === 404) return null; // File doesn't exist yet
    throw new Error(\`Failed to fetch \${path} sha\`);
  }
  const data = await res.json();
  return data.sha;
}

async function updateFile(path, content, token, commitMessage) {
  const sha = await getFileSha(path, token);
  const base64Content = Buffer.from(content).toString('base64');
  
  const url = \`https://api.github.com/repos/\${REPO_OWNER}/\${REPO_NAME}/contents/\${path}\`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: \`token \${token}\`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: commitMessage,
      content: base64Content,
      sha: sha,
      branch: BRANCH
    })
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to update file');
  }
  return true;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { token, appsData, appAdsText } = body;

    if (!token) {
      return NextResponse.json({ error: 'GitHub Token is required' }, { status: 401 });
    }

    if (appsData) {
      await updateFile(
        'src/data/apps.json', 
        JSON.stringify(appsData, null, 2), 
        token, 
        'Update apps.json via Admin Panel'
      );
    }

    if (appAdsText !== undefined) {
      await updateFile(
        'public/app-ads.txt', 
        appAdsText, 
        token, 
        'Update app-ads.txt via Admin Panel'
      );
    }

    return NextResponse.json({ success: true, message: 'Changes successfully pushed to GitHub! Cloudflare will rebuild your site shortly.' });
  } catch (error) {
    console.error("GitHub API Error:", error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}
