import { SIZE } from "@/consts/size";
import { SafeAreaView } from "react-native";
import { Text } from "react-native-paper";

export default function FinishScreen() {
    return(
        <SafeAreaView style={{ flex: 1, backgroundColor: "#090742", justifyContent: 'center', alignItems: 'center', paddingHorizontal: 0.1 * SIZE.WIDTH }}>
            <Text 
                style={{ 
                    fontSize: 0.1 * SIZE.WIDTH, 
                    fontFamily: "Righteous", 
                    fontWeight: 'bold', 
                    color: "white"
                    }}>
                        Despesa informada com sucesso!
                    </Text>
      </SafeAreaView>
    )
}