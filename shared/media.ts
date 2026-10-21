// Press and media coverage shown in the "Медіа про нас" section on the landing
// page. It is static on purpose: to add an article, put it at the top of this
// list and drop its cover image into public/img/media/.

export interface MediaPost {
    title: string
    sourceUrl: string
    imageUrl: string
}

export const MEDIA_POSTS: MediaPost[] = [
    {
        title: 'Лілка. Від ідеї до проєкту',
        sourceUrl: 'https://dou.ua/forums/topic/60173/',
        imageUrl: '/img/media/dou-lilka.jpg',
    },
    {
        title: 'Synth Days in Kyiv: inside the wartime Ukrainian modular scene - CDM Create Digital Music',
        sourceUrl:
            'https://cdm.link/inside-the-ukrainian-modular-scene-during-war/',
        imageUrl: '/img/media/cdm-synth-days.jpg',
    },
    {
        title: 'NU31 — новий мейкерський простір на Подолі, Київ - makerhub.org',
        sourceUrl: 'https://makerhub.org/nu31-hacker-space-kyiv/',
        imageUrl: '/img/media/makerhub.jpg',
    },
    {
        title: 'Мейкерство, інженерні тижні, уроки праці для дорослих. Спецвипуск із Юрієм Власюком і Оленою Шульгою',
        sourceUrl: 'https://www.youtube.com/watch?v=t1hMnVwN07Q',
        imageUrl: '/img/media/youtube-vlasiuk-shulha.jpg',
    },
    {
        title: "Inside Kyiv's hackerspace, a growing DIY synth and experimental noise scene - CDM Create Digital Music",
        sourceUrl: 'https://cdm.link/kyiv-diy/',
        imageUrl: '/img/media/cdm-kyiv-diy.jpg',
    },
]
