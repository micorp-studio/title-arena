// composables/useVideoMetadata.ts

export function useVideoMetadata() {
  // Shared metadata cache for the current seed
  const metadataCache = reactive(new Map())

  // Video data for specific seed
  const getVideoData = async (seedValue: number) => {
    // If we already have the data for this seed, return from cache
    if (metadataCache.has(seedValue)) {
      return metadataCache.get(seedValue)
    }

    // Create the metadata
    const data = {
      thumbnailUrl: `https://picsum.photos/seed/${seedValue}/640/360.webp`,
      videoDuration: generateDuration(seedValue),
      viewCount: generateViewCount(seedValue),
      timeAgo: generateTimeAgo(seedValue),
      // isVerified: parseInt(seedValue.toString(), 10) % 3 === 0,
      // user: await fetchUserData(seedValue)
    }

    // Cache the result
    metadataCache.set(seedValue, data)
    return data
  }

  // Helper functions
  const generateDuration = (seed: number) => {
    const seedNum = parseInt(seed.toString(), 10);
    const minutes = 40 //3 + (seedNum % 22);
    const seconds = (seedNum * 13) % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  const generateViewCount = (seed: number) => {
    const seedNum = parseInt(seed.toString(), 10);
    const views = seedNum % 99999999;
    return views > 1000000
      ? `${(views / 1000000).toFixed(1).replace('.0', '')} M vues`
      : views > 1000
        ? `${(views / 1000).toFixed(0)} k vues`
        : `${views} vues`;
  }

  const generateTimeAgo = (seed: number) => {
    const seedNum = parseInt(seed.toString(), 10);
    const options = ['heures', 'jours', 'semaines', 'mois'];
    const timeType = options[seedNum % options.length];
    const timeAmount = 1 + (seedNum % 11);
    return (timeAmount === 1 && timeType !== 'mois')
      ? `il y a ${timeAmount} ${timeType.slice(0, -1)}`
      : `il y a ${timeAmount} ${timeType}`;
  }

  const fetchUserData = async (seed: number) => {
    const response = await fetch(`https://randomuser.me/api/?seed=${seed}`);
    const data = await response.json();
    const user = data.results[0];

    const firstName = user.name.first;
    const lastName = user.name.last;

    const usernameFormats = [
      `${firstName} ${lastName}`,
      `${firstName}${lastName}`,
      `${firstName}_${lastName}`,
      `${firstName}.${lastName}`,
      `${firstName}${lastName}Official`,
      `${firstName}TV`,
      `${firstName}Tube`,
      `${lastName}Productions`,
    ];

    const formatIndex = parseInt(seed.toString(), 10) % usernameFormats.length;
    return {
      username: usernameFormats[formatIndex],
      avatarUrl: user.picture.medium
    };
  }

  // Utility to preload the next seed
  const preloadMetadata = async (nextSeedValue: number) => {
    if (!metadataCache.has(nextSeedValue)) {
      // Fetch the image first to warm browser cache
      const img = new Image();
      img.src = `https://picsum.photos/seed/${nextSeedValue}/640/360.webp`;

      // Then load all the metadata
      await getVideoData(nextSeedValue);
    }
  }

  return {
    getVideoData,
    preloadMetadata
  }
}
