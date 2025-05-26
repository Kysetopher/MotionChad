declare module '@/utils/neo4j/interface' {
  
    const graphInterface: {
      addSpreadsheet: (data: any) => Promise<any>;
      updateSpreadsheet: (tableId: string, updatedData: any) => Promise<any>;
      getSpreadSheet: (tableId: string) => Promise<any>;
    };
  
    export default graphInterface;
  }
  