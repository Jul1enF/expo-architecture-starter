import { StyleSheet, Text, ScrollView, View } from 'react-native';
import { useState } from 'react';
import GoingBackHeader from '@/components/ui/GoingBackHeader';
import Autocomplete from '@/components/ui/Autocomplete/Autocomplete';

import { RPH, RPW } from '@/utils/dimensions'
import { appStyle } from '@/styles/appStyle';

export default function Tab2Page() {

  const employeeList2 = [{"__v": 9, "_id": "694046fa9c31680cd45cf9b1", "contract_end": null, "createdAt": "2025-12-15T17:35:54.181Z", "email": "ju@ju.ju", "first_name": "Julien", "last_name": "Furic", "role": "owner", "updatedAt": "2026-04-20T08:33:13.943Z"}, {"__v": 7, "_id": "69404c019c31680cd45cf9b6", "contract_end": null, "createdAt": "2025-12-15T17:57:21.449Z", "email": "fu@fu.fu", "first_name": "Furic", "last_name": "De Concarneau", "role": "owner", "updatedAt": "2026-02-12T05:52:23.372Z"}, {"__v": 0, "_id": "69404c6a9c31680cd45cf9b9", "contract_end": null, "createdAt": "2025-12-15T17:59:06.923Z", "email": "sy@sy.sy", "first_name": "Chloé", "last_name": "Chataigne", "role": "owner", "updatedAt": "2026-02-13T13:23:52.690Z"}, {"__v": 0, "_id": "6940503c9c31680cd45cf9ce", "contract_end": null, "createdAt": "2025-12-15T18:15:24.060Z", "email": "fa@fa.fa", "first_name": "Fanny", "last_name": "Farance", "role": "employee", "updatedAt": "2025-12-21T22:41:34.502Z"}]

  const [selectedEmployee2, setSelectedEmployee2]=useState<null | unknown>(null)
  // console.log("selected employee :", selectedEmployee2)
  

  return (
    <>
      <GoingBackHeader previousPage="/tab1" previousPageName="Tab 1" />
      <ScrollView style={{ flex: 1, backgroundColor: appStyle.pageBody.backgroundColor }}
        contentContainerStyle={[
          appStyle.pageBody,
          { flex: undefined }
        ]}
        bounces={false}
        keyboardShouldPersistTaps="handled">
        <View style={{ minHeight: 2000, width : "100%", alignItems : "center" }}>

          <Text style={styles.pageTitle}>Tab 2 !</Text>

          <Autocomplete
          data={employeeList2}
          setSelectedItem={setSelectedEmployee2}
          selectedItem={selectedEmployee2}
          titleKey='first_name'
          inputStyle={[appStyle.input.base]}
          placeholderText='Rechercher un employé 2'
          placeholderColor="black"
          />

        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  body: {
    ...appStyle.pageBody,
    justifyContent: 'center',
  },
  pageTitle: {
    ...appStyle.pageTitle,
  },
});
