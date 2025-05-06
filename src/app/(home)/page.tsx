import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col justify-center text-center">
      <h1 className="mb-4 text-2xl font-bold">欢迎使用 FumaDocs Starter</h1>
      <p className="text-fd-muted-foreground">
        您可以打开{' '}
        <Link
          href="/docs"
          className="text-fd-foreground font-semibold underline"
        >
          /docs
        </Link>{' '}
        查看文档，也可以使用{' '}
        <Link
          href="/docs/components/"
          className="text-fd-foreground font-semibold underline"
        >
          /docs/components/
        </Link>{' '}
        查看组件文档。
      </p>
      <p className="text-fd-muted-foreground mt-4">
        或者您也可以使用{' '}
        <Link
          href="/docs/projects/todolist/"
          className="text-fd-foreground font-semibold underline"
        >
          /docs/projects/todolist/
        </Link>{' '}
        快速记录即时的想法和计划。
      </p>
      <p className="text-fd-muted-foreground mt-4">
        或者您也可以使用{' '}
        <Link
          href="/docs/projects/"
          className="text-fd-foreground font-semibold underline"
        >
          /docs/projects/
        </Link>{' '}
        记录您的项目和任务。
      </p>
      
      
    </main>
  );
}
