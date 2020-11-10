import React, { useEffect } from 'react';
import { Button } from 'antd';
import DemoCom from '@/components/Demo';
import { useDispatch } from 'umi';

interface Props {}

const Demo = (props: Props) => {
  console.log(props);
  const dispatch = useDispatch();
  // useEffect(() => {
  //   dispatch({
  //     type: '_test/query',
  //   });
  // }, []);
  return (
    <div>
      <Button type="primary">demo</Button>
      <DemoCom />
    </div>
  );
};

Demo.getInitialProps = async ({ store }: any) => {
  await store.dispatch({
    type: '_test/query',
  });
  return store.getState();
};

export default Demo;
