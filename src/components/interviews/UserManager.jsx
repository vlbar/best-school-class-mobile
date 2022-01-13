import React, { useEffect, useState } from 'react';

let users = [];

export default function UserManager({ userId, user: passedUser, fallbackLink, children }) {
  const [user, setUser] = useState(passedUser);

  useEffect(() => {
    if (user && !users.find(u => u.id === user.id)) users.push(user);
  }, [user]);

  useEffect(() => {
    if (!userId) return;

    const managedUser = users.find(u => u.id === userId);
    if (managedUser) setUser(managedUser);
    else fallbackLink?.fetch().then(setUser);
  }, [userId, fallbackLink]);

  return children({ user });
}
