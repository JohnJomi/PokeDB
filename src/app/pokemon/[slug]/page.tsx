import type { Metadata } from "next";
import { PokemonDetail } from "@/components/detail/PokemonDetail";
import { getIndex, getPokemon } from "@/lib/data";

export const dynamicParams = false; // unknown slugs return 404

export function generateStaticParams() {
  return getIndex().map(({ slug }) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pokemon = await getPokemon((await params).slug);
  const title = pokemon.name;
  const description = `${pokemon.name}, the ${pokemon.genus}. ${pokemon.description}`;
  return { title, description, openGraph: { title, description } };
}

export default async function Page({ params }: Props) {
  const pokemon = await getPokemon((await params).slug);
  return <PokemonDetail key={pokemon.slug} pokemon={pokemon} />;
}
