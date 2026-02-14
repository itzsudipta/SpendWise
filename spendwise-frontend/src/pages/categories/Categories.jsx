import React, { useEffect, useState } from 'react';
import { createCategory, deleteCategory, getCategoriesByUser } from '../../api/categoryService';
import { Card, Button } from '../../components/ui/BaseComponents';
import { useAuth } from '../../hooks/useAuth';

export default function Categories() {
  const [name, setName] = useState('');
  const [list, setList] = useState([]);
  const { user } = useAuth();
  const currentUserId = Number(user?.user_id || 1);

  const load = async () => {
    const res = await getCategoriesByUser(currentUserId);
    setList(res?.data || []);
  };

  useEffect(() => {
    load().catch(() => setList([]));
  }, [currentUserId]);

  const add = async () => {
    if (!name.trim()) return;
    await createCategory({ user_id: currentUserId, cy_name: name });
    setName('');
    await load();
  };

  const remove = async (id) => {
    await deleteCategory(id);
    await load();
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Categories</h3>
      <div className="flex gap-2">
        <input className="rounded-lg border p-2" placeholder="New category" value={name} onChange={(e) => setName(e.target.value)} />
        <Button onClick={add}>Create</Button>
      </div>
      <div className="grid gap-3">
        {list.map((item) => (
          <Card key={item.cy_id} className="flex items-center justify-between">
            <span>{item.cy_name}</span>
            <Button variant="danger" onClick={() => remove(item.cy_id)}>Delete</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
