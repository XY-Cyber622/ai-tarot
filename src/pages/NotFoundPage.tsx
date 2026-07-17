import StubPage from './StubPage';

export default function NotFoundPage() {
  return (
    <StubPage
      title="404"
      subtitle="这条路不存在"
      description="回到首页继续你的占卜之旅。"
      onBackPath="/"
    />
  );
}
