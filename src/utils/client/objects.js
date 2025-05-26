  const accessLEVEL = {
    PUBLIC_READ: {
      name: 'Public Read',
      description: 'Allows public access to read the resource.',
      value: 'PUBLIC_READ',
    },
    PUBLIC_WRITE: {
      name: 'Public Write',
      description: 'Allows public access to read and write to the resource.',
      value: 'PUBLIC_WRITE',
    },
    PRIVATE: {
      name: 'Private',
      description: 'Restricts access to the resource to authorized users only.',
      value: 'PRIVATE',
    },
    RESTRICTED_READ: {
      name: 'Restricted Read',
      description: 'Allows authenticated users access to  read the resource.',
      value: 'RESTRICTED_READ',
    },
    RESTRICTED_WRITE: {
      name: 'Restricted Write',
      description: 'Allows authenticated users access to read and write to the resource.',
      value: 'RESTRICTED_WRITE',
    },
  };