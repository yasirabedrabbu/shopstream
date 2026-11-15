"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "@/components/ui/SafeImage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Icon } from "@/components/ui/Icon";
import { productApi } from "@/lib/api";
import { DEMO_MODE, DEMO_STORES } from "@/lib/demo";
import { useLiveCategories } from "@/lib/useLiveCategories";
import type { PublicProductResponse } from "@/lib/types";
import styles from "./home.module.css";

const edits = [
  { id: "all", label: "The whole edit", href: "/products" },
  { id: "home", label: "For your space", href: "/products?category=home" },
  { id: "fashion", label: "Everyday wear", href: "/products?category=fashion" },
  { id: "under", label: "Under ৳2,000", href: "/products?maxPrice=199999&sort=price_asc" },
] as const;

const questions = [
  {
    question: "What is ShopStream?",
    answer:
      "A place to discover everyday favorites from independent stores across Bangladesh. Explore fashion, home, beauty, books, groceries, and tech in one thoughtfully organized collection.",
  },
  {
    question: "Can I buy something here?",
    answer:
      "Open a product, choose your quantity, and add it to your bag or buy it now. Review the full order details before placing your order.",
  },
  {
    question: "Do I need an account to explore?",
    answer:
      "You can browse without an account. You’ll be asked to sign in when you’re ready to place an order, then returned to your checkout.",
  },
  {
    question: "I have a store. Can I join?",
    answer:
      "Visit the seller page to explore the intended experience and learn how to get started with your store.",
  },
];

// Category images exist only for some slugs. Other slugs fall back to the home image.
const KNOWN_CATEGORY_IMAGES = ["home", "beauty", "fashion", "books", "grocery", "tech"];

function categoryImage(slug: string): string {
  return KNOWN_CATEGORY_IMAGES.includes(slug) ? `/images/cat-${slug}.webp` : "/images/cat-home.webp";
}

export default function HomePage() {
  const { categories } = useLiveCategories();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<PublicProductResponse[] | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [edit, setEdit] = useState<(typeof edits)[number]["id"]>("all");

  useEffect(() => {
    let active = true;
    productApi
      .list({ size: 12 })
      .then((data) => {
        if (active) {
          setProducts(data.content);
          setError(false);
        }
      })
      .catch(() => {
        if (active) {
          setProducts([]);
          setError(true);
        }
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  function search(event: FormEvent) {
    event.preventDefault();
    router.push(query.trim() ? `/products?q=${encodeURIComponent(query.trim())}` : "/products");
  }

  const selectedEdit = edits.find((item) => item.id === edit)!;
  const selectedProducts = products
    ?.filter(
      (product) =>
        edit === "all" ||
        (edit === "under"
          ? product.effectivePriceCents < 200000
          : product.category.slug === edit),
    )
    .slice(0, 4);

  return (
    <div className={styles.home}>
      <Nav />
      <main id="main-content" tabIndex={-1}>
        <section className={styles.hero} aria-labelledby="hero-heading">
          <div className={`page-width ${styles.heroGrid}`}>
            <div className={styles.heroCopy}>
              <p className={styles.kicker}>
                <span className={styles.statusDot} /> Independent spirit. Everyday finds.
              </p>
              <h1 id="hero-heading">
                Not just things.
                <br />
                Your kind
                <br />
                of <span className={styles.highlight}>things.</span>
              </h1>
              <p className={styles.heroDescription}>
                For the way you live, the things you love, and the little stores worth discovering.
                Find a little more you.
              </p>
              <div className={styles.heroActions}>
                <Link href="/products" className={styles.primaryLink}>
                  Find your next favorite <Icon name="arrowRight" size={18} />
                </Link>
                <a href="#the-edit" className={styles.textLink}>
                  Explore the edit <Icon name="chevron" size={16} />
                </a>
              </div>
              <form role="search" onSubmit={search} className={styles.search}>
                <Icon name="search" size={18} />
                <label htmlFor="home-search" className="sr-only">
                  Search products, stores, or categories
                </label>
                <input
                  id="home-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Looking for something in particular?"
                />
                <button type="submit" aria-label="Search the collection">
                  <Icon name="arrowRight" size={20} />
                </button>
              </form>
              <p className={styles.heroFootnote}>
                A marketplace with a local heart.
                <span>Bangladesh, beautifully everyday.</span>
              </p>
            </div>

            <div className={styles.heroVisual}>
              <div className={styles.heroPhoto}>
                <Image
                  src="/images/hero-shopper.webp"
                  alt="A shopper enjoying a quiet moment by a sunny window in Bangladesh"
                  fill
                  priority
                  sizes="(min-width: 1024px) 48vw, 100vw"
                  className={styles.cover}
                />
                <span className={styles.photoCaption}>
                  THE EVERYDAY ISSUE <span>NO. 01</span>
                </span>
              </div>
              <Link href="/products?category=beauty" className={styles.heroMiniCard}>
                <div className={styles.miniImage}>
                  <Image
                    src="/images/cat-beauty.webp"
                    alt="Botanical perfume in warm afternoon light"
                    fill
                    sizes="160px"
                    className={styles.cover}
                  />
                </div>
                <div>
                  <span className={styles.microLabel}>A moment for you</span>
                  <span className={styles.miniTitle}>
                    Little daily rituals <Icon name="arrowRight" size={17} />
                  </span>
                </div>
              </Link>
              <span className={styles.heroStamp} aria-hidden="true">
                GOOD FINDS.
                <br />
                <span>
                  GREAT LITTLE
                  <br />
                  STORES.
                </span>
                <Icon name="heart" size={22} />
              </span>
              <p className={styles.visualFootnote}>
                <span>Less ordinary. More meaningful.</span>
                <span>
                  SCROLL TO DISCOVER <Icon name="chevron" size={12} />
                </span>
              </p>
            </div>
          </div>
        </section>

        <div className={styles.promiseStrip} aria-label="Our approach">
          <div className={`page-width ${styles.promiseInner}`}>
            <span>
              <Icon name="store" size={18} /> Independent stores, one place
            </span>
            <span>
              <Icon name="heart" size={18} /> Chosen for everyday living
            </span>
            <span>
              <Icon name="search" size={18} /> A new favorite around every corner
            </span>
          </div>
        </div>

        <section className={`page-width ${styles.section}`} aria-labelledby="category-heading">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.kicker}>01 / FIND YOUR CORNER</p>
              <h2 id="category-heading">Your everyday, sorted.</h2>
            </div>
            <Link href="/products" className={styles.textLink}>
              Explore everything <Icon name="arrowRight" size={17} />
            </Link>
          </div>
          <div className={styles.categories}>
            {categories.map((category, index) => (
              <Link
                href={`/products?category=${category.slug}`}
                key={category.id}
                className={styles.categoryCard}
              >
                <div className={styles.categoryImage}>
                  <Image
                    src={categoryImage(category.slug)}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 16vw, 33vw"
                    className={styles.cover}
                  />
                  <span className={styles.categoryNumber}>0{index + 1}</span>
                </div>
                <span className={styles.categoryName}>
                  {category.name}
                  <Icon name="arrowRight" size={15} />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section id="the-edit" className={styles.editSection} aria-labelledby="edit-heading">
          <div className="page-width">
            <div className={styles.sectionHeading}>
              <div>
                <p className={styles.kicker}>02 / THE SHOPSTREAM EDIT</p>
                <h2 id="edit-heading">A few things you’ll love.</h2>
                <p className={styles.sectionDescription}>
                  Useful. Beautiful. A little unexpected. Start with something that feels like you.
                </p>
              </div>
              <Link href={selectedEdit.href} className={styles.textLink}>
                Shop this edit <Icon name="arrowRight" size={17} />
              </Link>
            </div>
            <div className={styles.editToolbar}>
              <div className={styles.editFilters} aria-label="Choose a product edit">
                {edits.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setEdit(item.id)}
                    aria-pressed={edit === item.id}
                    className={edit === item.id ? styles.activeFilter : styles.filter}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {error ? (
              <div role="alert" className={styles.emptyState}>
                <h3>The collection needs a little moment.</h3>
                <p>We couldn’t load these finds. Your selection has been kept.</p>
                <button
                  className={styles.primaryLink}
                  onClick={() => {
                    setError(false);
                    setProducts(null);
                    setAttempt((value) => value + 1);
                  }}
                >
                  Try again <Icon name="arrowRight" size={16} />
                </button>
              </div>
            ) : products === null ? (
              <div role="status" className={styles.productGrid}>
                <span className="sr-only">Loading products</span>
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className={styles.skeleton} />
                ))}
              </div>
            ) : selectedProducts?.length ? (
              <div className={styles.productGrid} aria-live="polite" aria-atomic="false">
                {selectedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <h3>A new edit is on its way.</h3>
                <p>There are no matching finds in this selection just yet.</p>
                <Link href="/products" className={styles.textLink}>
                  Explore all products <Icon name="arrowRight" size={16} />
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className={`page-width ${styles.section}`} aria-labelledby="mood-heading">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.kicker}>03 / LESS SEARCHING, MORE FEELING</p>
              <h2 id="mood-heading">Shop a state of mind.</h2>
            </div>
            <p className={styles.headingAside}>
              Not sure what you’re looking for?
              <br />
              Start with how you want to feel.
            </p>
          </div>
          <div className={styles.moodGrid}>
            <Link href="/products?category=home" className={styles.moodCard}>
              <div className={styles.moodImage}>
                <Image
                  src="/images/cat-home.webp"
                  alt="A peaceful reading corner with handwoven textures and warm natural light"
                  fill
                  sizes="(min-width: 768px) 56vw, 100vw"
                  className={styles.cover}
                />
                <span className={styles.imageTag}>THE SLOW LIVING EDIT</span>
              </div>
              <div className={styles.moodCopy}>
                <div>
                  <p className={styles.kicker}>A softer place to land</p>
                  <h3>Make room for slow.</h3>
                  <p>Natural textures. Quiet corners. A home that feels like you.</p>
                </div>
                <span className={styles.roundArrow}>
                  <Icon name="arrowRight" size={22} />
                </span>
              </div>
            </Link>
            <Link
              href="/products?category=beauty"
              className={`${styles.moodCard} ${styles.moodSecondary}`}
            >
              <div className={styles.moodImage}>
                <Image
                  src="/images/cat-beauty.webp"
                  alt="A glass perfume bottle on a natural stone tray"
                  fill
                  sizes="(min-width: 768px) 38vw, 100vw"
                  className={styles.cover}
                />
                <span className={styles.imageTag}>THE LITTLE RITUALS EDIT</span>
              </div>
              <div className={styles.moodCopy}>
                <div>
                  <p className={styles.kicker}>Just for the joy of it</p>
                  <h3>Your daily little ritual.</h3>
                  <p>Small moments, a little more considered.</p>
                </div>
                <span className={styles.roundArrow}>
                  <Icon name="arrowRight" size={22} />
                </span>
              </div>
            </Link>
          </div>
        </section>

        {DEMO_MODE && (
          <section className={`page-width ${styles.section}`} aria-labelledby="stores-heading">
            <div className={styles.sectionHeading}>
              <div>
                <p className={styles.kicker}>05 / YOUR NEXT FAVORITE STORE</p>
                <h2 id="stores-heading">Different stores. Same good spirit.</h2>
              </div>
            </div>
            <div className={styles.storeGrid}>
              {DEMO_STORES.map((store) => (
                <Link key={store.slug} href={`/stores/${store.slug}`} className={styles.storeCard}>
                  <span className={styles.storeInitial}>{store.storeName[0]}</span>
                  <h3>{store.storeName}</h3>
                  <p>{store.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section id="how-it-works" className={styles.howSection} aria-labelledby="how-heading">
          <div className={`page-width ${styles.howGrid}`}>
            <div>
              <p className={styles.kicker}>06 / LESS FUSS. MORE FINDS.</p>
              <h2 id="how-heading">
                From “just looking”
                <br />
                to “that’s the one.”
              </h2>
              <p className={styles.sectionDescription}>
                A little discovery should be the easy part of your day.
              </p>
              <Link href="/products" className={styles.textLink}>
                Let’s find your thing <Icon name="arrowRight" size={17} />
              </Link>
            </div>
            <ol className={styles.steps}>
              {[
                {
                  title: "Follow your curiosity",
                  text: "Browse a category, explore an edit, or search for something you already have in mind.",
                },
                {
                  title: "Get to know your find",
                  text: "Take a closer look at the product, its price, and the independent store behind it.",
                },
                {
                  title: "Make it yours",
                  text: "Review your details and your order before confirming your purchase.",
                },
              ].map((step, index) => (
                <li key={step.title}>
                  <span className={styles.stepNumber}>0{index + 1}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className={`page-width ${styles.faqSection}`} aria-labelledby="faq-heading">
          <div>
            <p className={styles.kicker}>07 / A LITTLE CLARITY</p>
            <h2 id="faq-heading">
              Good questions.
              <br />
              Simple answers.
            </h2>
            <p className={styles.sectionDescription}>
              A few things you might be wondering before you wander.
            </p>
            <Link href="/contact" className={styles.textLink}>
              More ways to get help <Icon name="arrowRight" size={16} />
            </Link>
          </div>
          <div className={styles.questions}>
            {questions.map((item, index) => (
              <details key={item.question} name="homepage-faq">
                <summary>
                  <span className={styles.questionIndex}>0{index + 1}</span>
                  <span>{item.question}</span>
                  <span className={styles.questionIcon}>
                    <Icon name="chevron" size={18} />
                  </span>
                </summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="for-sellers" className={`page-width ${styles.sellerSection}`} aria-labelledby="seller-heading">
          <div className={styles.sellerPanel}>
            <div>
              <p className={styles.kicker}>FOR THE INDEPENDENT-MINDED</p>
              <h2 id="seller-heading">
                A little store.
                <br />A big story to tell.
              </h2>
              <p>
                Bring your craft, your collection, your point of view.
                <br className={styles.desktopBreak} /> There’s a place for your story here.
              </p>
              <Link href="/sell" className={styles.darkLink}>
                Explore selling with us <Icon name="arrowRight" size={18} />
              </Link>
            </div>
            <div className={styles.sellerIllustration} aria-hidden="true">
              <span className={styles.sellerWord}>
                YOUR
                <br />
                NEXT
                <br />
                CHAPTER.
              </span>
              <span className={styles.sellerArrow}>
                <Icon name="arrowRight" size={72} strokeWidth={1.2} />
              </span>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}