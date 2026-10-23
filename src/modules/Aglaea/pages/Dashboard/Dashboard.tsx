import { ServerSelected } from "./components";
import { Flex } from 'antd'

export const Dashboard = () => {
    return (
        <Flex vertical gap={16}>
            <ServerSelected />
        </Flex>
    );
};