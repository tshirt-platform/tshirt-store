export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-32">
      <h1 className="text-4xl font-bold">TShirt Custom</h1>
      <p className="text-muted-foreground mt-4 text-lg">
        Thiết kế áo thun theo ý bạn
      </p>
      <a
        href="/products"
        className="bg-primary text-primary-foreground mt-8 rounded-lg px-8 py-3 font-medium"
      >
        Khám phá sản phẩm
      </a>
    </div>
  )
}
