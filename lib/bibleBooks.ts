// Livros do Novo Testamento, em ordem canônica, com o número de capítulos de cada um.
export const NT_BOOKS: { name: string; chapters: number }[] = [
  { name: "Mateus", chapters: 28 },
  { name: "Marcos", chapters: 16 },
  { name: "Lucas", chapters: 24 },
  { name: "João", chapters: 21 },
  { name: "Atos", chapters: 28 },
  { name: "Romanos", chapters: 16 },
  { name: "1 Coríntios", chapters: 16 },
  { name: "2 Coríntios", chapters: 13 },
  { name: "Gálatas", chapters: 6 },
  { name: "Efésios", chapters: 6 },
  { name: "Filipenses", chapters: 4 },
  { name: "Colossenses", chapters: 4 },
  { name: "1 Tessalonicenses", chapters: 5 },
  { name: "2 Tessalonicenses", chapters: 3 },
  { name: "1 Timóteo", chapters: 6 },
  { name: "2 Timóteo", chapters: 4 },
  { name: "Tito", chapters: 3 },
  { name: "Filemom", chapters: 1 },
  { name: "Hebreus", chapters: 13 },
  { name: "Tiago", chapters: 5 },
  { name: "1 Pedro", chapters: 5 },
  { name: "2 Pedro", chapters: 3 },
  { name: "1 João", chapters: 5 },
  { name: "2 João", chapters: 1 },
  { name: "3 João", chapters: 1 },
  { name: "Judas", chapters: 1 },
  { name: "Apocalipse", chapters: 22 },
];

export const NT_TOTAL_CHAPTERS = NT_BOOKS.reduce((sum, b) => sum + b.chapters, 0); // 260
export const PSALMS_TOTAL_CHAPTERS = 150;

/** Retorna o nome do livro e o capítulo (dentro do livro) para o N-ésimo capítulo
 * absoluto do Novo Testamento (1-indexado, 1..260). */
export function ntChapterAt(absoluteIndex: number): { book: string; chapter: number } {
  let remaining = absoluteIndex;
  for (const book of NT_BOOKS) {
    if (remaining <= book.chapters) {
      return { book: book.name, chapter: remaining };
    }
    remaining -= book.chapters;
  }
  const last = NT_BOOKS[NT_BOOKS.length - 1];
  return { book: last.name, chapter: last.chapters };
}
